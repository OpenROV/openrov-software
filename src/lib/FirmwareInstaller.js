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
  var baseDirectory = path.join(__dirname, '..', '..', 'linux');

  installer.unpack = function(filename) {
    var cmd =  path.join(baseDirectory, 'firmware-unpack.sh');
    var args = [ filename ];

    var process = spawn(cmd, args);
    var directory = '';
    
    process.stdout.on('data', function (data) {
        directory = data;
    });
      
    process.on('exit', function (code) {
      console.log('firmware-unpack finished with code' + code);
      installer.emit("firmwareinstaller-unpacked", directory);
    });      
  }

  installer.compile = function(directory) {

    var cmd =  path.join(baseDirectory, 'firmware-compile.sh');
    var args = [ filename ];

    var process = spawn(cmd, args);

    var result = '';
    
    process.stdout.on('data', function (data) {
        result = data;
    });
      
    process.on('exit', function (code) {
      console.log('firmware-compile finished with code' + code);
      installer.emit("firmwareinstaller-compilled", directory);
    });      
  }

  installer.upload = function(directory) {
    var cmd =  path.join(baseDirectory, 'firmware-upload.sh');
    var args = [ filename ];

    var process = spawn(cmd, args);

    var result = '';
    
    process.stdout.on('data', function (data) {
        result = data;
    });
      
    process.on('exit', function (code) {
      console.log('firmware-compile finished with code' + code);
      installer.emit("firmwareinstaller-uploaded", directory);
    });      
  }

  return installer;
}

module.exports = FirmwareInstaller;
