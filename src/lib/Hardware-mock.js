var EventEmitter = require('events').EventEmitter, StatusReader = require('./StatusReader'), CONFIG = require('./config');
function Hardware() {
  var hardware = new EventEmitter();
  var reader = new StatusReader();
  hardware.depthHoldEnabled = false;
  hardware.targetHoldEnabled = false;

  reader.on('Arduino-settings-reported', function (settings) {
    hardware.emit('Arduino-settings-reported', settings);
  });
  hardware.connect = function () {
    console.log('!Serial port opened');
  };
  hardware.write = function (command) {
    console.log('HARDWARE-MOCK:' + command);
    var commandParts = command.split(/\(|\)/);
    var commandText = commandParts[0];
    if (commandText === 'rcap') {
      hardware.emit('status', reader.parseStatus('CAPA:255'));
    }
    if (commandText === 'ligt') {
      hardware.emit('status', reader.parseStatus('LIGP:' + commandParts[1] / 255));
      console.log('HARDWARE-MOCK return light status');
    }
    if (commandText === 'tilt') {
      hardware.emit('status', reader.parseStatus('servo:' + commandParts[1]));
      console.log('HARDWARE-MOCK return servo status');
    }

    // Depth hold
    if (commandText === 'holdDepth_toggle') {
        var targetDepth = 0;
        if (!hardware.depthHoldEnabled) {
            targetDepth = 10;
            hardware.depthHoldEnabled = true;
            console.log('HARDWARE-MOCK depth hold enabled');
        }
        else {
            targetDepth = -500;
            hardware.depthHoldEnabled = false
            console.log('HARDWARE-MOCK depth hold DISABLED');
        }
        hardware.emit('status', reader.parseStatus('targetDepth:' + targetDepth));
    }

    // Heading hold
    if (commandText === 'holdHeading_toggle') {
        var targetHeading = 0;
        if (!hardware.targetHoldEnabled) {
            targetHeading = 10;
            hardware.targetHoldEnabled= true;
            console.log('HARDWARE-MOCK heading hold enabled');
        }
        else {
            targetHeading = -500;
            hardware.targetHoldEnabled = false
            console.log('HARDWARE-MOCK heading hold DISABLED');
        }
        hardware.emit('status', reader.parseStatus('targetHeading:' + targetHeading));
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
    var data = 'vout:8.3;iout:0.2;';
    var status = reader.parseStatus(data);
    hardware.emit('status', status);
  }
  return hardware;
}
module.exports = Hardware;