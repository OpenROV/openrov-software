var SerialPort = require('serialport').SerialPort;
var CONFIG = require('./config');

var OFFSET = 128;

var OpenROVController = function() {
  var serial;

  if (CONFIG.production) serial = new SerialPort('/dev/ttyUSB0', { baud: 9600 }) // Arduino Duemilanove

  // Serial controls Arduino.  TODO: cut out Arduino and use BeagleBone for PWM
  // ACM0 - Uno
  // USB0 - Duemillanove

  var controller = {};
  controller.sendCommand = function(throttle, yaw, lift) {
    var left = 0,
        right = 0;
    left = right = throttle;
    left += yaw;
    right -= yaw;
    left = map(left);
    right = map(right);
    lift = Math.round(exp(lift)) + 128;
    var command = 'go(' + left + ',' + right + ',' + lift + ');';
    if(CONFIG.debug) console.error("command", command);
    if(CONFIG.production) serial.write(command);
  }

  return controller;
}

function map(val) {
  val = limit(val, -127, 127);
  val = Math.round(exp(val));
  val += OFFSET;
  return val;
}

function exp(val) {
  if(val === 0) return 0;
  var sign = val / Math.abs(val);
  var adj = Math.pow(127, Math.abs(val) / 127);
  return sign * adj;
}

function limit(value, l, h) { // truncate anything that goes outside of -127, 127
  return Math.max(l, Math.min(h, value));
}

module.exports = OpenROVController;