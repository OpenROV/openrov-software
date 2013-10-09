/*
 *
 * Description:
 * This file holds the controller logic.  It manages the connection to the Atmega328.
 *
 */
var path = require('path')
  , spawn = require('child_process').spawn
  , CONFIG = require('./config')
  , StatusReader = require('./StatusReader')
  , ArduinoPhysics = require('./ArduinoPhysics')
  , logger = require('./logger').create(CONFIG)
  , EventEmitter = require('events').EventEmitter
  , Hardware = require('./Hardware');

var navdata = {
    roll: 0,
    pitch: 0,
    yaw: 0,
    thrust: 0,
    deapth : 0
}

var settingsCollection = {
    smoothingIncriment: 0,
    deadZone_min: 0,
    deadZone_max: 0
}

var rovsys = {
    capabilities: 0
}

var stripANGHeader = function(data){
    var sections = data.split('|');
    var parts = sections[1].split(',');
    var n = navdata;
    n.roll = parts[0];
    n.pitch = parts[1];
    n.yaw = parts[2];
    return n;
};

var setup_serial = function(){
    var location = path.join(__dirname, '..', './linux')
    logger.log('Starting the script from ' + location +' to setup UART1...');
    var setuart_process = spawn('sudo', [ path.join(location,'setuart.sh') ]);
};


var OpenROVController = function(eventLoop) {
  var serial;
  var globalEventLoop = eventLoop;
  var physics = new ArduinoPhysics();
  var hardware = new Hardware();
  hardware.on('status', function(data) {
    controller.emit('status',status);

    if ('ver' in status) {
      controller.ArduinoFirmwareVersion = status.ver;
    }
    if ('IMUMatrix' in status) {
      controller.emit('navdata',stripANGHeader(status.IMUMatrix));
    }
    if ('TSET' in status) {
      console.log(status.settings);
      var setparts = status.settings.split(",");
      settingsCollection.smoothingIncriment = setparts[0];
      settingsCollection.deadZone_min = setparts[1];
      settingsCollection.deadZone_max = setparts[2];
      controller.emit('Arduino-settings-reported',settingsCollection)
    }     
    if ('CAPA' in status) {
      var s = rovsys;
      console.log("RovSys: " + status.CAPA)
      s.capabilities = parseInt(status.CAPA);
      controller.Capabilities= s.capabilities;
      controller.emit('rovsys',s);
    }
    if ('cmd' in status) {
      var s = rovsys;
      console.log("cmd: " + status.cmd)
    }
    if ('log' in status) {
      var s = rovsys;
      console.log("log: " + status.log)
    }
  });

  hardware.on('Arduino-settings-reported', function(settings) {
    controller.emit('Arduino-settings-reported', settings);
  });
  
  setup_serial();

  hardware.connect();

  var controller = new EventEmitter();

  controller.ArduinoFirmwareVersion = 0;
  controller.Capabilities = 0;

  controller.requestCapabilities = function(){
    console.log("Sending rcap to arduino");
    var command = 'rcap();';
    hardware.write(command);    
  };
  
  controller.requestSettings = function(){
    var command = 'reportSetting();';
    hardware.write(command);    
  };
  
  controller.updateSetting = function(){
    var command = 'updateSetting(' + CONFIG.preferences.get('smoothingIncriment') + ',' + physics.mapMotor(CONFIG.preferences.get('deadzone_neg')) + ','+ physics.mapMotor(CONFIG.preferences.get('deadzone_pos')) + ');';
    hardware.write(command);    
  };  

  controller.notSafeToControl = function(){ //Arduino is OK to accept commands
    if (this.ArduinoFirmwareVersion >= .20130314034859) return false;
    if (this.Capabilities != 0) return false; //This feature added after the swap to ms on the Arduino
    console.log('Audrino is at an incompatible version of firmware. Upgrade required before controls will respond');
    console.log(this.ArduinoFirmwareVersion);
    console.log(this.Capabilities);
    return true;
  };


    controller.sendMotorTest = function(port, starbord, vertical) {
        if (this.notSafeToControl()) return;
        var command = 'go(' + physics.mapRawMotor(port) + ',' + physics.mapRawMotor(vertical) + ',' + physics.mapRawMotor(starbord) + ',1);'; //the 1 bypasses motor smoothing
        hardware.write(command);
    };

    controller.sendCommand = function(throttle, yaw, vertical) {
      if (this.notSafeToControl()) return;
      var motorCommands = physics.mapMotors(throttle, yaw, vertical);
      var command = 'go(' + motorCommands.port + ',' + motorCommands.vertical + ',' + motorCommands.starbord + ');';
      hardware.write(command);
    };
  
    controller.sendTilt = function(value) {
        if (this.notSafeToControl()) return;
        var servoTilt = physics.mapTiltServo(value);
        var command = 'tilt(' + servoTilt +');';
        hardware.write(command);
    };

    controller.sendLight = function(value) {
        if (this.notSafeToControl()) return;
        var light = physics.mapLight(value);
        var command = 'light(' + light +');';
        hardware.write(command);
    };
    
    controller.stop = function(value) {
        if (this.notSafeToControl()) return;
        var command = 'stop();';
        hardware.write(command);
    };
    
    controller.start = function(value) {
        if (this.notSafeToControl()) return;
        var command = 'start();';
        hardware.write(command);
    };    

  globalEventLoop.on('register-ArdunoFirmwareVersion', function(val){
        controller.ArduinoFirmwareVersion = val;
  });

  globalEventLoop.on('register-ArduinoCapabilities', function(val){
        controller.Capabilities = val;
  });


  globalEventLoop.on('serial-stop', function(){
	logger.log("Closing serial connection for firmware upload");
	hardware.close();
	 });

  globalEventLoop.on('serial-start', function(){
	hardware.connect();
	controller.updateSetting();
	logger.log("Opened serial connection after firmware upload");
	});

  return controller;
}

module.exports = OpenROVController;
