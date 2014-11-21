/*
 *
 * Description:
 * This file holds the controller logic.  It manages the connection to the Atmega328.
 *
 */
var path = require('path'), spawn = require('child_process').spawn, CONFIG = require('./config'), StatusReader = require('./StatusReader'), ArduinoPhysics = require('./ArduinoPhysics'), logger = require('./logger').create(CONFIG), EventEmitter = require('events').EventEmitter, Hardware = require('../' + CONFIG.Hardware);
var setup_serial = function () {
  var location = path.join(__dirname, '..', './linux');
  logger.log('Starting the script from ' + location + ' to setup UART1...');
  var setuart_process = spawn('sudo', [path.join(location, 'setuart.sh')]);
  setuart_process.on('error', function (err) {
    logger.log('Error while starting the UART1 setup scipt!\nThe error was: ' + err);
  });
};
var navdata = {
    roll: 0,
    pitch: 0,
    yaw: 0,
    thrust: 0,
    deapth: 0,
    hdgd: 0
  };
var statusdata = {};
var settingsCollection = {
    smoothingIncriment: 0,
    deadZone_min: 0,
    deadZone_max: 0
  };
var rovsys = { capabilities: 0 };
var OpenROVController = function (eventLoop) {
  var serial;
  var globalEventLoop = eventLoop;
  var reader = new StatusReader();
  var physics = new ArduinoPhysics();
  var hardware = new Hardware();
  var controller = new EventEmitter();
  setInterval(function () {
    controller.emit('navdata', navdata);
  }, 100);
  setInterval(function () {
    controller.emit('status', statusdata);
  }, 1000);
  hardware.on('serial-recieved', function (data) {
    globalEventLoop.emit('serial-recieved', data);
  });
  hardware.on('status', function (status) {
    for (var i in status) {
      statusdata[i] = status[i];
    }
    if ('ver' in status) {
      controller.ArduinoFirmwareVersion = status.ver;
    }
    if ('TSET' in status) {
      console.log(status.settings);
      var setparts = status.settings.split(',');
      settingsCollection.smoothingIncriment = setparts[0];
      settingsCollection.deadZone_min = setparts[1];
      settingsCollection.deadZone_max = setparts[2];
      controller.emit('Arduino-settings-reported', settingsCollection);
    }
    if ('CAPA' in status) {
      var s = rovsys;
      console.log('RovSys: ' + status.CAPA);
      s.capabilities = parseInt(status.CAPA);
      controller.Capabilities = s.capabilities;
      controller.emit('rovsys', s);
    }
    if ('cmd' in status) {
      if (status.com != 'ping(0)'){
        console.log('cmd: ' + status.cmd);
        controller.emit('command', status.cmd);
      }
    }
    if ('log' in status) {
      console.log('log: ' + status.log);
    }
    if ('hdgd' in status) {
      navdata.hdgd = status.hdgd;
    }
    if ('deap' in status) {
      navdata.deapth = status.deap;
    }
    if ('pitc' in status) {
      navdata.pitch = status.pitc;
    }
    if ('roll' in status) {
      navdata.roll = status.roll;
    }
    if ('yaw' in status) {
      navdata.yaw = status.yaw;
    }
    if ('fthr' in status) {
      navdata.thrust = status.fthr;
    }
    if ('mtrmod' in status){
	console.log('mtrmod: ' + status.mtrmod);
    }
    if ('boot' in status){
      this.Capabilities = 0;
      controller.updateSetting();
      controller.requestSettings();
      controller.requestCapabilities();
    }
  });
  setup_serial();
  hardware.connect();
  controller.ArduinoFirmwareVersion = 0;
  controller.Capabilities = 0;
  controller.requestCapabilities = function () {
    console.log('Sending rcap to arduino');
    var command = 'rcap();';
    hardware.write(command);
  };
  controller.requestSettings = function () {
    var command = 'reportSetting();';
    hardware.write(command);
    command = 'rmtrmod();';
    hardware.write(command);
    console.log('send rmtrmod');
  };
  controller.updateSetting = function () {

    var command = 'updateSetting(' + CONFIG.preferences.get('smoothingIncriment') + ',' + CONFIG.preferences.get('deadzone_neg') + ',' + CONFIG.preferences.get('deadzone_pos') + ',' + CONFIG.preferences.get('water_type') + ';';
    hardware.write(command);
    //This is the multiplier used to make the motor act linear fashion.
    //for example: the props generate twice the thrust in the positive direction
    //than the negative direction.  To make it linear we have to multiply the
    //negative direction * 2.
    var port = CONFIG.preferences.get('thrust_modifier_port');
    var vertical = CONFIG.preferences.get('thrust_modifier_vertical');
    var starbord = CONFIG.preferences.get('thrust_modifier_starbord');
    var nport = CONFIG.preferences.get('thrust_modifier_nport');
    var nvertical = CONFIG.preferences.get('thrust_modifier_nvertical');
    var nstarbord = CONFIG.preferences.get('thrust_modifier_nstarbord');
    if (CONFIG.preferences.get('reverse_port_thruster')) {
      port = port * -1;
      nport = nport * -1;
    }
    if (CONFIG.preferences.get('reverse_lift_thruster')) {
      vertical = vertical * -1;
      nvertical = nvertical * -1;
    }
    if (CONFIG.preferences.get('reverse_starbord_thruster')) {
      starbord = starbord * -1;
      nstarbord = nstarbord * -1;
    }
    //API to Arduino to pass a percent in 2 decimal accuracy requires multipling by 100 before sending.
    command = 'mtrmod1(' + port * 100 + ',' + vertical * 100 + ',' + starbord * 100 + ');';
    hardware.write(command);
    command = 'mtrmod2(' + nport * 100 + ',' + nvertical * 100 + ',' + nstarbord * 100 + ');';
    hardware.write(command);
  };
  controller.notSafeToControl = function () {
    //Arduino is OK to accept commands. After the Capabilities was added, all future updates require
    //being backward safe compatible (meaning you cannot send a command that does something unexpected but
    //instead it should do nothing).
    if (this.Capabilities !== 0)
      return false;
    //This feature added after the swap to ms on the Arduino
    console.log('Waiting for the capability response from Arduino before sending command.');
    console.log('Arduno Version: ' + this.ArduinoFirmwareVersion);
    console.log('Capability bitmap: ' + this.Capabilities);
    return true;
  };
  controller.send = function (cmd) {
    var command = cmd + ';';
    hardware.write(command);
  };
  controller.sendMotorTest = function (port, starbord, vertical) {
    if (this.notSafeToControl())
      return;
    var command = 'go(' + physics.mapRawMotor(port) + ',' + physics.mapRawMotor(vertical) + ',' + physics.mapRawMotor(starbord) + ',1);';
    //the 1 bypasses motor smoothing
    hardware.write(command);
  };
  controller.sendCommand = function (throttle, yaw, vertical) {
    if (this.notSafeToControl())
      return;
    var motorCommands = physics.mapMotors(throttle, yaw, vertical);
    var command = 'go(' + motorCommands.port + ',' + motorCommands.vertical + ',' + motorCommands.starbord + ');';
    hardware.write(command);
  };
  controller.sendTilt = function (value) {
    if (this.notSafeToControl())
      return;
    var servoTilt = physics.mapTiltServo(value);
    var command = 'tilt(' + servoTilt + ');';
    hardware.write(command);
  };
  controller.sendLight = function (value) {
    if (this.notSafeToControl())
      return;
    var command = 'ligt(' + physics.mapLight(value) + ');';
    hardware.write(command);
  };
  var claserstate = 0;
  controller.sendLaser = function (value) {
    if (this.notSafeToControl())
      return;
    if (claserstate === 0) {
      claserstate = 255;
    } else {
      claserstate = 0;
    }
    var command = 'claser(' + claserstate + ');';
    hardware.write(command);
  };
  controller.stop = function (value) {
    if (this.notSafeToControl())
      return;
    var command = 'stop();';
    hardware.write(command);
  };
  controller.start = function (value) {
    if (this.notSafeToControl())
      return;
    var command = 'start();';
    hardware.write(command);
  };
  globalEventLoop.on('register-ArdunoFirmwareVersion', function (val) {
    controller.ArduinoFirmwareVersion = val;
  });
  globalEventLoop.on('register-ArduinoCapabilities', function (val) {
    controller.Capabilities = val;
  });
  globalEventLoop.on('SerialMonitor_toggle_rawSerial', function () {
    hardware.toggleRawSerialData();
  });
  globalEventLoop.on('serial-stop', function () {
    logger.log('Closing serial connection for firmware upload');
    hardware.close();
  });
  globalEventLoop.on('serial-start', function () {
    hardware.connect();
    controller.updateSetting();
    controller.requestSettings();
    controller.requestCapabilities();
    logger.log('Opened serial connection after firmware upload');
  });

  //Every few seconds we check to see if capabilities or settings changes on the arduino.
  //This handles the cases where we have garbled communication or a firmware update of the arduino.
  setInterval(function () {
    if (controller.notSafeToControl() === false) return;
      controller.updateSetting();
      controller.requestSettings();
      controller.requestCapabilities();
  }, 1000);

  return controller;
};
module.exports = OpenROVController;
