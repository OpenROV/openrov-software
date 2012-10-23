/*
 * Created for OpenROV:  www.openrov.com
 * Author:  Dominik Fretz<info@codewithpassion.com>
 * Date: 2012-10-11
 *
 * Description:
 * This module starts the video-server.js file in the root to mock a video stream.
 *  
 * License
 * This work is licensed under the Creative Commons Attribution-ShareAlike 3.0 Unported License.
 * To view a copy of this license, visit http://creativecommons.org/licenses/by-sa/3.0/ or send a
 * letter to Creative Commons, 444 Castro Street, Suite 900, Mountain View, California, 94041, USA.
 *
 */

var fork = require('child_process').fork
  , EventEmitter = require('events').EventEmitter
  , fs = require('fs')
  , path = require('path')
  , CONFIG = require('./config')
  , logger = require('./logger').create(CONFIG.debug)
  ;

var OpenROVCamera = function (options) {
  var camera = new EventEmitter();
  var _capturing = false;
  var captureProcess;

  // End camera process gracefully
  camera.close = function() {
     _capturing = false; 
    logger.log('sending SIGHUP to capture process');
    process.kill(capture_process.pid, 'SIGHUP');
  }

  // Actual camera capture function
  camera.capture = function (callback) {
    captureProcess = fork(path.join(__dirname, 'mock-video-server.js'));
    camera.emit('started'); 
  };
  return camera;
};

module.exports = OpenROVCamera;
