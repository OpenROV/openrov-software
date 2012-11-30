/*
 *
 * Description:
 * This file holds the controller logic.  It manages the connection to the Atmega328.
 *
 */
var serialPort = require('serialport')
  , path = require('path')
  , spawn = require('child_process').spawn
  , CONFIG = require('./config')
  , StatusReader = require('./StatusReader')
  , ArduinoPhysics = require('./ArduinoPhysics')
  , logger = require('./logger').create(CONFIG.debug)
  , EventEmitter = require('events').EventEmitter;

var setup_serial = function(){
    var location = path.join(__dirname, '..', './linux')
    logger.log('Starting the script from ' + location +' to setup UART1...');
    var setuart_process = spawn('sudo', [ path.join(location,'setuart.sh') ]);
};

var getNewSerial = function(){
	return new serialPort.SerialPort(CONFIG.serial, {
        baudrate: CONFIG.serial_baud,
        parser: serialPort.parsers.readline("\r\n")
    });
};

var OpenROVController = function(eventLoop) {
  var serial;
  var globalEventLoop = eventLoop;
  var reader = new StatusReader();
  var physics = new ArduinoPhysics();

  setup_serial();

  // ATmega328p is connected to Beaglebone over UART1 (pins TX 24, RX 26)
  if (CONFIG.production) serial = getNewSerial();


  var controller = new EventEmitter();

  serial.on( "data", function( data ) {
      var status = reader.parseStatus(data);
      controller.emit('status',status);
  });

    controller.sendMotorTest = function(port, starbord, vertical) {
        var command = 'go(' + port + ',' + vertical + ',' + starbord + ');';
        if(CONFIG.debug_commands) console.error("command", command);
        if(CONFIG.production) serial.write(command);
    };

  controller.sendCommand = function(throttle, yaw, vertical) {
    var motorCommands = physics.mapMotors(throttle, yaw, vertical);
    var command = 'go(' + motorCommands.port + ',' + motorCommands.vertical + ',' + motorCommands.starbord + ');';
    if(CONFIG.debug_commands) console.error("command", command);
    if(CONFIG.production) serial.write(command);
  };

    controller.sendTilt = function(value) {
        var servoTilt = physics.mapTiltServo(value);
        var command = 'tilt(' + servoTilt +');';
        if(CONFIG.debug_commands) console.error("command", command);
        if(CONFIG.production) serial.write(command);
    };

    controller.sendLight = function(value) {
        var light = physics.mapLight(value);
        var command = 'light(' + light +');';
        if(CONFIG.debug_commands) console.error("command", command);
        if(CONFIG.production) serial.write(command);
    };

  globalEventLoop.on('serial-stop', function(){
	logger.log("Closing serial connection for firmware upload");
	serial.close();
	 });

  globalEventLoop.on('serial-start', function(){
	serial = getNewSerial();
	logger.log("Opened new serial connection after firmware upload");
	});

  return controller;
}

module.exports = OpenROVController;
