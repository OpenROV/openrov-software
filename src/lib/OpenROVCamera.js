/*
 *
 * Description:
 * This script creates a directory and sends that as an argument to a spawned process (capture.cpp).
 * Then, it sends a request to capture a frame with file name of current time at a given interval.
 * Lastly, when (capture.cpp) responds with the file name (meaning save completed), it reads the file
 * and then emits the content to the Node.js server in base64 (string) format.
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
  var month = time.getMonth();
  var date = time.getDate();
  if (month < 10) month = '0' + month;
  if (date < 10) date = '0' + date;
  // /dev/shm/ is in-memory resource on Linux
  // location will look something like:  /dev/shm/1970-01-01/
  var location = path.resolve('/dev/shm/' + time.getFullYear() +
      '-' + month +
      '-' + date + '/');

  // Open capture app as a child process
  var cmd = './capture';  // rename to correspond with your C++ compilation
  var default_opts = {
    device : '/dev/video0'
  };

  var options = orutils.mixin(options, default_opts);
  var _capturing = false;

  // End camera process gracefully
  camera.close = function() {
    if (!_capturing) return;
    if (CONFIG.debug) console.log('closing camera on', options.device);
    _capturing = false;
    if (CONFIG.debug) console.log('writing \'exit\' to capture process');
    capture_process.stdin.write('exit');
    if (CONFIG.debug) console.log('sending SIGHUP to capture process');
    process.kill(capture_process.pid, 'SIGHUP');
  }

  // Actual camera capture function
  camera.capture = function (callback) {
    if (_capturing) return process.nextTick(callback);
    if (CONFIG.debug) console.log('initiating camera on', options.device);
    if (CONFIG.debug) console.log('writing images to ', location);

    if (!fs.existsSync(location)) fs.mkdirSync(location, 0755);

    // if camera working, should be at options.device (most likely /dev/video0 or similar)
    fs.exists(options.device, function(exists) {
      // no camera?!
      if (!exists) return callback(new Error(options.device + ' does not exist'));
      // wooooo!  camera!
      if (CONFIG.debug) console.log(options.device, ' found');
      _capturing = true; // then remember that we're capturing
      if (CONFIG.debug) console.log('spawning capture process...');
      // start OpenCV capture process (capture.cpp).  Will look like:  ./capture /dev/shm/1970-01-01/
      capture_process = spawn(cmd, [location]);

      // when ./capture responds, image has been saved
      capture_process.stderr.on('data', function(data) {
        console.error('capture err:', data.toString());
      });
      capture_process.stdout.on('data', handleCaptureData);
      capture_process.on('exit', function(something) {
        console.error('capture exited:', something);
      });
      var _captured = false;
      capture_process.stdout.on('data', function() {
        if(_captured) return;
        _captured = true;
        if (CONFIG.debug) console.log('starting capture loop with interval:', options.delay);

        callback();

        // loop based on delay in milliseconds
        setInterval(grab, options.delay);
      });
    });
  };

  function grab() {
    var format = ".jpg";

    fs.exists(options.device, function (exists) {
      // uh-oh, no camera connected!
      if (!exists) return camera.emit('error.device', new Error('no device (' + options.device + ').'));
      capture_process.stdin.write(location + '/' + getTime() + format + '\n\r');
    });
  };

  // What happens when the process takes a photo and saves it to disk (memory)
  function handleCaptureData(response) {
    // remove any trailing newline chars... or white space
    var file = response.toString().replace(/(\r\n|\n|\r)/gm, '');
    // this verifies that the process started via response
    if (file === location) return console.log('initialized capture process.');
    // if (CONFIG.debug) console.log('Reading', file);

    // open file from system, then emit to server
    // send to client as base64 string (for javascript manipulation of img/source)
    fs.readFile(file, 'base64', function(err, img) {
      if (err) return console.error('error reading file', file, err);
      // if (CONFIG.debug) console.log('read file', file);
      camera.emit('frame', img);  // send image to server (to be sent to client)
      fs.unlink(file);  // free from memory
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
