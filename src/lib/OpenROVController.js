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
var statusdata = {};
var settingsCollection = {
    smoothingIncriment: 0,
    deadZone_min: 0,
    deadZone_max: 0
  };

var rovsys = { capabilities: 0 };

var OpenROVController = function (eventLoop, client) {
  var controller = this;
  var serial;
  var globalEventLoop = eventLoop;
  this.physics = new ArduinoPhysics();
  this.hardware = new Hardware();
  this.cockpit = client;

  setInterval(function () {
    controller.emit('status', statusdata);
  }, 1000);

  this.hardware.on('serial-recieved', function (data) {
    globalEventLoop.emit('serial-recieved', data);
  });

  this.hardware.on('status', function (status) {
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
    if ('boot' in status){
      this.Capabilities = 0;
      controller.updateSetting();
      controller.requestSettings();
      controller.requestCapabilities();
    }
  });
  setup_serial();
  this.hardware.connect();
  controller.ArduinoFirmwareVersion = 0;
  controller.Capabilities = 0;

  globalEventLoop.on('register-ArdunoFirmwareVersion', function (val) {
    controller.ArduinoFirmwareVersion = val;
  });
  globalEventLoop.on('register-ArduinoCapabilities', function (val) {
    controller.Capabilities = val;
  });

  globalEventLoop.on('SerialMonitor_toggle_rawSerial', function () {
    controller.hardware.toggleRawSerialData();
  });

  globalEventLoop.on('serial-stop', function () {
    logger.log('Closing serial connection for firmware upload');
    controller.hardware.close();
  });

  globalEventLoop.on('serial-start', function () {
    controller.hardware.connect();
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
OpenROVController.prototype = new EventEmitter();
OpenROVController.prototype.constructor = OpenROVController;

OpenROVController.prototype.notSafeToControl = function () {
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


OpenROVController.prototype.send = function (cmd) {
  var controller = this;
  if (controller.notSafeToControl())
    return;

  var command = cmd + ';';
  console.log('Sending command to arduino: ' + command);

  controller.hardware.write(command);
};

OpenROVController.prototype.requestCapabilities = function () {
  console.log('Sending rcap to arduino');
  var command = 'rcap();';
  this.hardware.write(command);
};

OpenROVController.prototype.requestSettings = function () {
  //todo: Move to motor-diag plugin
  var command = 'reportSetting();';
  this.hardware.write(command);
  command = 'rmtrmod();';
  this.hardware.write(command);
};

OpenROVController.prototype.updateSetting = function () {
  var command = 'updateSetting(' + CONFIG.preferences.get('smoothingIncriment') + ',' + CONFIG.preferences.get('deadzone_neg') + ',' + CONFIG.preferences.get('deadzone_pos') + ',' + CONFIG.preferences.get('water_type') + ';';
  this.hardware.write(command);
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
  //todo: Move to motor-diag plugin
  //API to Arduino to pass a percent in 2 decimal accuracy requires multipling by 100 before sending.
  command = 'mtrmod1(' + port * 100 + ',' + vertical * 100 + ',' + starbord * 100 + ');';
  this.hardware.write(command);
  command = 'mtrmod2(' + nport * 100 + ',' + nvertical * 100 + ',' + nstarbord * 100 + ');';
  this.hardware.write(command);
};

OpenROVController.prototype.sendMotorTest = function (port, starbord, vertical) {
  var command = 'go(' + this.physics.mapRawMotor(port) + ',' +
    this.physics.mapRawMotor(vertical) + ',' +
    this.physics.mapRawMotor(starbord) + ',1)';
  //the 1 bypasses motor smoothing
  this.send(command);
};

OpenROVController.prototype.sendCommand = function (throttle, yaw, vertical) {
  var motorCommands = this.physics.mapMotors(throttle, yaw, vertical);
  var command =
    'go(' + motorCommands.port + ',' +
    motorCommands.vertical + ',' +
    motorCommands.starbord + ')';
  this.send(command);
};

OpenROVController.prototype.stop = function (value) {
  var command = 'stop()';
  this.send(command);
};

OpenROVController.prototype.start = function (value) {
  var command = 'start()';
  this.send(command);
};

OpenROVController.prototype.registerPassthrough = function(config) {
  var self = this;
  if (config) {
    if (!config.messagePrefix) {
      throw new Error('You need to specify a messagePrefix that is used to emit and receive message.');
    }
    var messagePrefix = config.messagePrefix;
    if (config.fromROV) {
      if (Array.isArray(config.fromROV)) {
        config.fromROV.forEach(function(item) {
          self.on('status', function (data) {
            if (item in data) {
              self.cockpit.emit(messagePrefix+'.'+item, data[item]);
            }
          });
        });
      }
      else { throw new Error('config.fromROV needs to be an array.'); }
    }
    if (config.toROV) {
      if (Array.isArray(config.toROV)) {
        config.toROV.forEach(function(item) {
          self.cockpit.on(messagePrefix+'.'+item, function(data) {
            var args = Array.isArray(data) ? data.join() : data;
            var command = item + '(' + args + ')';
            self.send(command);
          });
        });
      }
      else { throw new Error('config.toROV needs to be an array.'); }
    }
  }
};

module.exports = OpenROVController;
