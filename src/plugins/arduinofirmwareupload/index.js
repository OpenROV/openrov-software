var CONFIG = require('../../lib/config');
var FirmwareInstaller = require('../../' + CONFIG.FirmwareInstaller);
var logger = require('../../lib/logger').create(CONFIG);
var path = require('path');
var fs = require('fs');

function arduinofirmwareupload(name, deps) {
  console.log('Loaded the Arduino Firmware upload pluign.');

  var controller = { socket: deps.cockpit };
  controller.files = {};
  controller.installer = new FirmwareInstaller(deps.globalEventLoop);

  controller.socket.on('plugin.arduinoFirmwareUpload.install', function () {
    controller.install();
  });

  controller.installer.on('firmwareinstaller-unpacking', function () {
    controller.socket.emit('plugin.arduinoFirmwareUpload.status', {
      key: 'unpacking',
      value: 'true'
    });
  });
  controller.installer.on('firmwareinstaller-unpacked', function (directory) {
    logger.log('Unpacked firmware file into ' + directory);
    controller.socket.emit('plugin.arduinoFirmwareUpload.status', {
      key: 'unpacked',
      value: 'true'
    });
    controller.socket.emit('plugin.arduinoFirmwareUpload.status', {
      key: 'compiling',
      value: 'true'
    });  //controller.installer.compile(directory);
  });
  controller.installer.on('firmwareinstaller-compilled', function (directory) {
    logger.log('Compiled firmware in directory ' + directory);
    controller.socket.emit('plugin.arduinoFirmwareUpload.status', {
      key: 'compiled',
      value: 'true'
    });
    controller.socket.emit('plugin.arduinoFirmwareUpload.status', {
      key: 'arduinoUploading',
      value: 'true'
    });
  });
  controller.installer.on('firmwareinstaller-uploaded', function (directory) {
    logger.log('Uploaded firmware to arduino!' + directory);
    controller.socket.emit('plugin.arduinoFirmwareUpload.status', {
      key: 'compiled',
      value: 'true'
    });
    controller.socket.emit('plugin.arduinoFirmwareUpload.status', {
      key: 'arduinoUploaded',
      value: 'true'
    });
  });
  controller.installer.on('firmwareinstaller-output', function (data) {
    controller.socket.emit('plugin.arduinoFirmwareUpload.output', data);
  });
  //This will flow to the ArduinoFirmwareViewModel.js self.updateStatus function
  controller.installer.on('firmwareinstaller-failed', function (data) {
    data = {};
    data.errorMessage = true;
    controller.socket.emit('plugin.arduinoFirmwareUpload.status', data);
  });
  controller.install = function () {
    logger.log('going to install from the source folder');
    controller.installer.installfromsource();
  };
  return controller;

}
module.exports = arduinofirmwareupload;