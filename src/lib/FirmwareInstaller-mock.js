/*
 * Created for OpenROV:  www.openrov.com
 * Author:  Dominik
 * Date: 06/03/12
 *
 * Description:
 * This file acts as a mock implementation for the camera module. It reads jpg files from a directory and returns them.
 *  
 * License
 * This work is licensed under the Creative Commons Attribution-ShareAlike 3.0 Unported License.
 * To view a copy of this license, visit http://creativecommons.org/licenses/by-sa/3.0/ or send a
 * letter to Creative Commons, 444 Castro Street, Suite 900, Mountain View, California, 94041, USA.
 *
 */
var EventEmitter = require('events').EventEmitter, fs = require('fs'), path = require('path'), CONFIG = require('./config'), logger = require('./logger').create(CONFIG);
var FirmwareInstaller = function () {
  var installer = new EventEmitter();
  installer.installfromsource = function () {
    installer.install('');
  };
  installer.unpack = function (filename) {
    setTimeout(function () {
      installer.emit('firmwareinstaller-unpacked', 'some directory');
    }, 2000);
  };
  installer.compile = function (directory) {
    setTimeout(function () {
      installer.emit('firmwareinstaller-output', 'Stated compiling\n');
    }, 500);
    setTimeout(function () {
      installer.emit('firmwareinstaller-output', 'Do compiling\n');
    }, 1000);
    setTimeout(function () {
      installer.emit('firmwareinstaller-compilled', directory);
    }, 2000);
  };
  installer.upload = function (directory) {
    setTimeout(function () {
      installer.emit('firmwareinstaller-uploaded', directory);
    }, 2000);
  };
  installer.install = function (filename) {
    installer.unpack(filename);
    setTimeout(installer.compile, 2000);
    setTimeout(installer.upload, 4000);
  };
  return installer;
};
module.exports = FirmwareInstaller;