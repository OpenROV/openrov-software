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

var spawn = require('child_process').spawn
  , util = require('util')
  , EventEmitter = require('events').EventEmitter
  , fs = require('fs')
  , path = require('path')
  ;

var orutils = require('./orutils')
var CONFIG = require('./config');

var OpenROVCamera = function (options) {
  var camera = new EventEmitter();
  var capture_process;
  // Create dir (current date) to save images into
  var time = new Date();
  var location = __dirname + '/../../' + time.getFullYear() +
      '-' + time.getMonth() +
      '-' + time.getDate() + '/';

  // Open capture app as a child process
  var cmd = './capture';  // rename to correspond with your C++ compilation
  var default_opts = {
    device : '/dev/video0'
  };

  var options = orutils.mixin(options, default_opts);
  var _capturing = false;

  camera.close = function() {
    if (!_capturing) return;
    _capturing = false;
    capture_process.stdin.write('exit');
    process.kill(capture_process.pid, 'SIGHUP');
  }

  camera.capture = function (callback) {
    if (_capturing) return process.nextTick(callback);

    if (!path.existsSync(location)) fs.mkdirSync(location, 0755);

    path.exists(options.device, function(exists) {
      if (!exists) return callback(new Error(options.device + ' does not exist'));
      _capturing = true;
      capture_process = spawn(cmd, [location]);

      // when ./capture responds, image has been saved
      capture_process.stdout.on('data', handleCaptureData);

      // loop based on delay in milliseconds
      setInterval(grab, options.delay);
    });
  };

  function grab() {
    var format = ".jpg";

    path.exists(options.device, function (exists) {
      // uh-oh, no camera connected!
      if (!exists) return camera.emit('error.device', new Error('no device (' + self.opts.device + ').'));
      capture_process.stdin.write(getTime() + format + '\n\r');
    });
  };

  function handleCaptureData(response) {
    // remove any trailing newline chars
    var file = response.toString().replace(/(\r\n|\n|\r)/gm, '');
    console.error("DEBUG: file", file);
    var imgFile = location + file;

    if (CONFIG.debug) console.log('Sending: ' + file);

    // open file from system, then emit to server
    fs.readFile(imgFile, 'base64', function(err, img) {
      if (!err) camera.emit('frame', img);
      else console.error(err);
      fs.unlink(imgFile);  // comment out this line to store footage on ROV (warning: takes up lots of space)
    });
  }

  return camera;
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

module.exports = OpenROVCamera;