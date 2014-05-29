/*
 * Created for OpenROV:  www.openrov.com
 * Author:  Dominik
 * Date: 06/03/12
 *
 * Description:
 * This file acts as a mock implementation for the camera module. It reads jpg files from a directory and returns them.
 *
 */
var EventEmitter = require('events').EventEmitter, fs = require('fs'), path = require('path'), CONFIG = require('./config'), logger = require('./logger').create(CONFIG), spawn = require('child_process').spawn;
var FirmwareInstaller = function (eventLoop) {
  var globalEventLoop = eventLoop;
  var installer = new EventEmitter();
  var baseDirectory = path.join(__dirname, '..', '..', 'linux', 'arduino');
  var installscript = 'firmware-install.sh';
  installer.installfromsource = function () {
    installscript = 'firmware-installfromsource.sh';
    installer.install('');
  };
  installer.install = function (filename) {
    var cmd = path.join(baseDirectory, installscript);
    var args = [filename];
    var process = spawn(cmd, args);
    process.on('exit', function (code) {
      if (code !== 0) {
        console.log('---- Error detected in Arduino Firmware update process ----');
        installer.emit('firmwareinstaller-failed', '');
      }
      globalEventLoop.emit('serial-start');
      installer.emit('firmwareinstaller-completed', '');
    });
    process.stderr.on('data', function (data) {
      console.log(data.toString());
      installer.emit('firmwareinstaller-output', data.toString());
    });
    process.stdout.on('data', function (data) {
      if (data.toString().indexOf('unpacking') === 0) {
        installer.emit('firmwareinstaller-unpacking');
      }
      if (data.toString().indexOf('unpacked') === 0) {
        installer.emit('firmwareinstaller-unpacked', '');
      }
      if (data.toString().indexOf('compilling') === 0) {
      }
      if (data.toString().indexOf('compilled') === 0) {
        installer.emit('firmwareinstaller-compilled', '');
        globalEventLoop.emit('serial-stop');  //avrdude.firmwareuploader();
      }
      if (data.toString().indexOf('uploading') === 0) {
      }
      if (data.toString().indexOf('uploaded') === 0) {
        installer.emit('firmwareinstaller-uploaded', '');
      }
    });
  };
  return installer;
};
module.exports = FirmwareInstaller;
