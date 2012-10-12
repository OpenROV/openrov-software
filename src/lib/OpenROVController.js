/*
 *
 * Description:
 * This file holds the controller logic.  It manages the connection to the Atmega328.
 *
 */

var path = require('path');
var SerialPort = require('serialport').SerialPort;
var CONFIG = require('./config');

var OFFSET = 90;

var OpenROVController = function() {
  var serial;

  // ATmega328p is connected to Beaglebone over UART1 (pins TX 24, RX 26)
  if (CONFIG.production) serial = new SerialPort('/dev/ttyO1', { baudrate: 115200 });

  var controller = {};
  controller.sendCommand = function(throttle, yaw, vertical) {
    var port = 0,
        starbord = 0;
    port = starbord = throttle;
    port += yaw;
    starbord -= yaw;
    port = map(port);
    starbord = map(starbord);
    vertical = Math.round(exp(vertical)) + 90;
    var command = 'go(' + port + ',' + vertical + ',' + starbord + ');';
    if(CONFIG.debug) console.error("command", command);
    if(CONFIG.production) serial.write(command);
  };

  return controller;
}

function map(val) {
  val = limit(val, -90, 90);
  val = Math.round(exp(val));
  val += OFFSET;
  return val;
}

function exp(val) {
  if(val === 0) return 0;
  var sign = val / Math.abs(val);
  var adj = Math.pow(90, Math.abs(val) / 90);
  return sign * adj;
}

function limit(value, l, h) { // truncate anything that goes outside of -127, 127
  return Math.max(l, Math.min(h, value));
}

module.exports = OpenROVController;
