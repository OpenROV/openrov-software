var EventEmitter = require('events').EventEmitter, StatusReader = require('./StatusReader'), CONFIG = require('./config');
function Hardware() {
  var DISABLED = 'DISABLED';
  var hardware = new EventEmitter();
  var reader = new StatusReader();
  var emitRawSerial = false;
  hardware.depthHoldEnabled = false;
  hardware.targetHoldEnabled = false;
  hardware.laserEnabled = false;

  reader.on('Arduino-settings-reported', function (settings) {
    hardware.emit('Arduino-settings-reported', settings);
  });
  hardware.connect = function () {
    console.log('!Serial port opened');
  };
  hardware.toggleRawSerialData = function toggleRawSerialData() {
    emitRawSerial = !emitRawSerial;
  };

  hardware.write = function (command) {
    console.log('HARDWARE-MOCK:' + command);
    var commandParts = command.split(/\(|\)/);
    var commandText = commandParts[0];
    if (commandText === 'rcap') {
      hardware.emitStatus('CAPA:255');
    }
    if (commandText === 'ligt') {
      hardware.emitStatus('LIGP:' + commandParts[1] / 255);
      console.log('HARDWARE-MOCK return light status');
    }
    if (commandText === 'tilt') {
      hardware.emitStatus('servo:' + commandParts[1]);
      console.log('HARDWARE-MOCK return servo status');
    }
    if (commandText === 'claser') {
        if (hardware.laserEnabled) {
          hardware.laserEnabled = false;
          hardware.emitStatus('claser:0');
        }
        else {
          hardware.laserEnabled = true;
          hardware.emitStatus('claser:255');
        }
    }

    // Depth hold
    if (commandText === 'holdDepth_toggle') {
        var targetDepth = 0;
        if (!hardware.depthHoldEnabled) {
            targetDepth = currentDepth;
            hardware.depthHoldEnabled = true;
            console.log('HARDWARE-MOCK depth hold enabled');
        }
        else {
            targetDepth = -500;
            hardware.depthHoldEnabled = false;
            console.log('HARDWARE-MOCK depth hold DISABLED');
        }
        hardware.emitStatus(
          'targetDepth:' +
          (hardware.depthHoldEnabled ? targetDepth.toString() : DISABLED)
        );
    }

    // Heading hold
    if (commandText === 'holdHeading_toggle') {
        var targetHeading = 0;
        if (!hardware.targetHoldEnabled) {
            targetHeading = currentHeading;
            hardware.targetHoldEnabled= true;
            console.log('HARDWARE-MOCK heading hold enabled');
        }
        else {
            targetHeading = -500;
            hardware.targetHoldEnabled = false;
            console.log('HARDWARE-MOCK heading hold DISABLED');
        }
        hardware.emitStatus(
          'targetHeading:' + (hardware.targetHoldEnabled ? targetHeading.toString() : DISABLED)
        );
    }

    //aux servo
    if (commandText === 'xsrv.exe') {
      hardware.emit('status', reader.parseStatus('xsrv.ext:' + commandParts[1]));
    }

    // example tests for passthrough
    if (commandText === 'example_to_foo') {
      hardware.emitStatus('example_foo:' + commandParts[1]);
    }
    if (commandText === 'example_to_bar') {
      hardware.emitStatus('example_bar:' + commandParts[1]);
    }
    hardware.emitStatus('cmd:' + command);
  };
  hardware.emitStatus = function(status) {
    var txtStatus = reader.parseStatus(status);
    hardware.emit('status', txtStatus);
    if (emitRawSerial) {
      hardware.emit('serial-recieved', status);
    }
  };
  hardware.close = function () {
    console.log('!Serial port closed');
  };
  var time = 1000;
  setInterval(function () {
    hardware.emit('status', reader.parseStatus('time:' + time));
    time += 1000;
  }, 1000);
  setInterval(sendEvent, 3000);
  function sendEvent() {
    var data = 'vout:9.9;iout:0.2;BT1I:0.3;BT2I:0.5';
    var status = reader.parseStatus(data);
    hardware.emit('status', status);
  }

  var currentDepth = 0;
  var currentHeading = 0;
  var interval = setInterval(function() {
    currentDepth += 0.5;
    hardware.emit('status', reader.parseStatus('deap:' + currentDepth));
    if (currentDepth > 50) {
      currentDepth = 0;
    }

    currentHeading += 5;
    hardware.emit('status', reader.parseStatus('hdgd:' + currentHeading));
    if (currentHeading >= 360) {
      currentHeading = 0;
    }

  }, 2000);



  return hardware;
}
module.exports = Hardware;