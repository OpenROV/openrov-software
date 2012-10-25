/*
 * Created for OpenROV:  www.openrov.com
 * Author:  Dominik
 * Date: 06/03/12
 *
 * Description:
 * This file acts as a mock implementation for the camera module. It reads jpg files from a directory and returns them.
 *
 */

var EventEmitter = require('events').EventEmitter
  , fs = require('fs')
  , path = require('path')
  , CONFIG = require('./config')
  , logger = require('./logger').create(CONFIG.debug)
  , spawn = require('child_process').spawn
  ;

var FirmwareInstaller = function () {
  var installer = new EventEmitter();
  var baseDirectory = path.join(__dirname, '..', '..', 'linux', 'arduino');

  installer.unpack = function(filename) {
    var cmd =  path.join(baseDirectory, 'firmware-unpack.sh');
    var args = [ filename ];

    var process = spawn(cmd, args);
    var directory = '';
    
    process.stdout.on('data', function (data) {
        if (directory === '') { 
		directory = data;
		console.log("using directory: " + data); 
	}
    });

    process.on('exit', function (code) {
      console.log('firmware-unpack finished with code ' + code);
      installer.emit("firmwareinstaller-unpacked", directory);
    });      
  }

  installer.compile = function(directory) {

    var cmd =  path.join(baseDirectory, 'firmware-build.sh');
    var args = [ directory ];

    var process = spawn(cmd, args);
    console.log("Starting compile process " + cmd + " in with directory " + directory);

    var result = '';
    
    process.stdout.on('data', function (data) {
	console.log("there was data from compile: " + data);
        result = data;
    });

    process.stderr.on('data', function(data) {
        console.log("error output from compile: " + data);
    });
      
    process.on('exit', function (code) {
      console.log('firmware-compile finished with code' + code);
      installer.emit("firmwareinstaller-compilled", directory);
    });      
  }

  installer.upload = function(directory) {
    var cmd =  path.join(baseDirectory, 'firmware-upload.sh');
    var args = [ directory ];


    console.log("Starting upload process " + cmd + " in with directory " + directory);
    var process = spawn(cmd, args);

    var result = '';
    
    process.stdout.on('data', function (data) {
        result = data;
    });

    process.stderr.on('data', function (data) {
       console.log('error data: ' + data);
    });
      
    process.on('exit', function (code) {
      console.log('firmware-compile finished with code' + code);
      installer.emit("firmwareinstaller-uploaded", directory);
    });      
  }

  return installer;
}

module.exports = FirmwareInstaller;
