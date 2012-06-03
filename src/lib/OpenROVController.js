var SerialPort = require('serialport').SerialPort;

var setup_serial = function(){
  var fs = require('fs');
  fs.writeFile('/sys/kernel/debug/omap_mux/uart1_txd', 0, function(err){
    if(err)
      console.log(err);
    else 
      console.log('TX set');
  });
};


var CONFIG = require('./config');
var OFFSET = 128;

var OpenROVController = function() {
  var serial;
  
  setup_serial();

  // ATmega328p is connected to Beaglebone over UART1 (pins TX 24, RX 26)
  if (CONFIG.production) serial = new SerialPort('/dev/ttyO1', { baud: 9600 });

  var controller = {};
  controller.sendCommand = function(throttle, yaw, vertical) {
    var port = 0,
        starbord = 0;
    port = starbord = throttle;
    port += yaw;
    starbord -= yaw;
    port = map(port);
    starbord = map(starbord);
    vertical = Math.round(exp(vertical)) + 128;
    if (port < 30) port = 30;
    if (starbord < 30) starbord = 30;
    if (vertical < 30) vertical = 30;
    var command = 'go(' + port + ',' + vertical + ',' + starbord + ');';
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
