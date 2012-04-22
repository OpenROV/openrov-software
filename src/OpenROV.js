/*
 * Created for OpenROV:  www.openrov.com
 * Author:  Bran Sorem (www.bransorem.com)
 * Date: 04/21/12
 *
 * Description:
 * This script creates a directory and sends that as an argument to a spawned process (capture.cpp).
 * Then, it sends a request to capture a frame with file name of current time at a given interval.
 * Lastly, when (capture.cpp) responds with the file name (meaning save completed), it reads the file
 * and then emits the content to the Node.js server in base64 (string) format.
 *
 * Special thanks to pdeschen (blog.rassemblr.com):
 * https://github.com/pdeschen/camelot
 *
 * License
 * This work is licensed under the Creative Commons Attribution-ShareAlike 3.0 Unported License.
 * To view a copy of this license, visit http://creativecommons.org/licenses/by-sa/3.0/ or send a
 * letter to Creative Commons, 444 Castro Street, Suite 900, Mountain View, California, 94041, USA.
 *
 */

var socket = require('socket.io'),
  spawn = require('child_process').spawn,
  util = require('util'),
  events = require('events'),
  fs = require('fs'),
  path = require('path');

// var serialPort = require('serialport').SerialPort
//    , serial = new serialPort('/dev/ttyACM0', { baud: 9600 })
//    , serial = new serialPort('/dev/ttyUSB0', { baud: 9600 })

// Serial controls Arduino.  TODO: cut out Arduino and use BeagleBone for PWM
// ACM0 - Uno
// USB0 - Duemillanove

// Create dir (current date) to save images into
var time = new Date();
var location = time.getFullYear() +
    '-' + time.getMonth() +
    '-' + time.getDate() + '/';

// Open capture app as a child process
var cmd = './capture';  // rename to correspond with your C++ compilation
var capture_process = spawn(cmd, [location]);
var default_opts = { device : '/dev/video0' };


/* =====================================
   =========== OpenROV class ===========
   ===================================== */
var OpenROV = function (options){
  events.EventEmitter.call(this);
  this.emitter = events;
  this.opts = mixin(options, default_opts);
  this._capturing = false;
  return this;
};
util.inherits(OpenROV, events.EventEmitter);

var OFFSET = 128;
OpenROV.prototype.sendCommand = function(throttle, yaw, lift) {
  var left = 0,
      right = 0;
  left = right = throttle;
  left += yaw;
  right -= yaw;
  left = Math.round(limit(left, -127, 127)) + OFFSET;
  right = Math.round(limit(right, -127, 127)) + OFFSET;
  lift = Math.round(lift) + 128;
  var command = left + ',' + right + ',' + lift + ';';
  if(process.env.NODE_DEBUG) console.error("DEBUG: command", command);
  // serialPort.write(command);
}

function limit(value, l, h) {
  return Math.max(l, Math.min(h, value));
}

// ============ init() ============
// create directory to store photos
// ================================
OpenROV.prototype.init = function() {
  if(!path.existsSync(location)) fs.mkdirSync(location, 0755);
};

// ============ reset() ===============
// reset the device to default settings
// ====================================
OpenROV.prototype.reset = function (){
  this.opts = default_opts;
  return default_opts;
};

// ============ update(options) ============
// options (obj)
// update options of rov instance
// =========================================
OpenROV.prototype.update = function (options){
  this.opts = mixin(options, this.opts)
  return this.opts;
};

// ============ close() =============
// close the camera and child process
// ==================================
OpenROV.prototype.close = function(){
  if(!this._capturing) return;
  this._capturing = false;
  capture_process.stdin.write('exit');
  process.kill(capture_process.pid, 'SIGHUP');
};

// ============ capture(options, callback) ============
// options (obj) - options for controlling camera
// callback (function) - callback function
// Captures a frame from camera and emits it as 'frame'
// ====================================================
OpenROV.prototype.capture = function (options, callback){
  if(this._capturing) return process.nextTick(callback);
  this._capturing = true;
  this.opts = mixin(options, this.opts);
  var rov = this;

  // when ./capture responds, image has been saved
  capture_process.stdout.on('data', function(response){
    // remove any trailing newline chars
    var file = response.toString().replace(/(\r\n|\n|\r)/gm, '');
    var imgFile = location + file;

    console.log('Sending: ' + file);

    // open file from system, then emit to server
    fs.readFile(imgFile, 'base64', function(err, img){
      if (!err) rov.emit('frame', img);
      fs.unlink(imgFile);  // comment out this line to store footage on ROV (warning: takes up lots of space)
    });
  });

  // this function loops, 'grabs' frame from camera (sends stdin to child process ./capture)
  var grab = function (){
    var self = this;
    self.emitter = this.emitter;
    self.arguments = [];
    format = ".jpg";

    path.exists(rov.opts.device, function (exists){

      // only call this function if camera is connected
      var alive = function (){
        var file = getTime() + format + '\n\r';
        capture_process.stdin.write(file);
      }

      // uh-oh, no camera connected!
      if (!exists){
        var message = 'no device (' + self.opts.device + ').';
        var err = new Error(message);
        self.emit('error.device', err);
        if (callback){ callback.call(err); }
        // hope it changes
        fs.watchFile(self.opts.device, function (curr, prev){ alive.apply(self); });
        return;
      }
      alive.apply(self);

    });
  };

  // loop based on delay (if set) in milliseconds
  if (this.opts.delay){
    setInterval(function (self){
      grab.apply(self);
    }, this.opts.delay, this);
  } else { grab.apply(this); }
};



// ================================================
// get current time in image name format
function getTime(){
  var t = new Date(),
    hrs = t.getHours(),
    min = t.getMinutes(),
    sec = t.getSeconds(),
    millisec = t.getMilliseconds();
  // Make text width consistent
  if (min < 10) min = '0' + min;
  if (sec < 10) sec = '0' + sec;
  if (millisec < 100){
    if (millisec < 10){ millisec = '0' + millisec; }
    millisec = '0' + millisec;
  }
  var id = hrs + '.' + min + '.' + sec + '.' + millisec;

  return id;
}

// ============ mixin (source, destination) ============
// -source (obj)
// -destination (obj)
// combines parameters from source and destination
// ============
// special thanks to pdeschen for this function
// originally created for Camelot:
//    https://github.com/pdeschen/camelot
// =====================================================
var mixin = function (source, destination){

  if (typeof (source) == "object"){
    for ( var prop in source){
      if ((typeof (source[prop]) == "object") && (source[prop] instanceof Array)){
        if (destination[prop] === undefined){
          destination[prop] = [];
        }
        for ( var index = 0; index < source[prop].length; index += 1){
          if (typeof (source[prop][index]) == "object"){
            if (destination[prop][index] === undefined){
              destination[prop][index] = {};
            }
            destination[prop].push(mixin(source[prop][index], destination[prop][index]));
          } else {
            destination[prop].push(source[prop][index]);
          }
        }
      } else if (typeof (source[prop]) == "object"){
        if (destination[prop] === undefined){
          destination[prop] = {};
        }
        mixin(source[prop], destination[prop]);
      } else {
        destination[prop] = source[prop];
      }
    }
  }

  return destination;
};

module.exports = OpenROV;
