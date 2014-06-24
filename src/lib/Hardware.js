var serialPort = require('serialport'), EventEmitter = require('events').EventEmitter, StatusReader = require('./StatusReader'), CONFIG = require('./config'), logger = require('./logger').create(CONFIG);
function Hardware() {
  var hardware = new EventEmitter();
  var reader = new StatusReader();
  var serialConnected = false;
  var emitRawSerialData = false;
  hardware.serial = {};
  var self = this;
  reader.on('Arduino-settings-reported', function (settings) {
    hardware.emit('Arduino-settings-reported', settings);
  });
  hardware.connect = function () {

    hardware.serial = new serialPort.SerialPort(CONFIG.serial, {
      baudrate: CONFIG.serial_baud,
      parser: serialPort.parsers.readline('\r\n')
    });

    hardware.serial.on("open", function () {
      serialConnected = true;
      logger.log('Serial port open');
    });

    hardware.serial.on('close', function (data) {
      logger.log('!Serial port closed');
      serialConnected = false;
    });

    hardware.serial.on('data', function (data) {
      var status = reader.parseStatus(data);
      hardware.emit('status', status);
      if (emitRawSerialData)
        hardware.emit('serial-recieved', data + '\n');
    });
  };
  hardware.write = function (command) {
    logger.log(command);
    if (CONFIG.production && serialConnected) {
      hardware.serial.write(command);
      if (emitRawSerialData)
        hardware.emit('serial-sent', command);
    } else {
      logger.log('DID NOT SEND');
    }
  };
  hardware.toggleRawSerialData = function toggleRawSerialData() {
    emitRawSerialData = !emitRawSerialData;
  };
  hardware.close = function () {
    serialConnected = false;
    //This code is a work around for a race condition in the serial port code https://github.com/voodootikigod/node-serialport/issues/241#issuecomment-43058353
    var sp = hardware.serial;
    hardware.serial.flush(function(err) {
      setTimeout(function() {
        sp.close(function(err) {
        });
      }, 10);
  });

  };
  return hardware;
}
module.exports = Hardware;