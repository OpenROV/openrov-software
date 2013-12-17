var EventEmitter = require('events').EventEmitter
  , StatusReader = require('./StatusReader')
  , CONFIG = require('./config');

function Hardware() {
	var hardware = new EventEmitter();
	var reader = new StatusReader();
	
	reader.on('Arduino-settings-reported', function(settings) {
		hardware.emit('Arduino-settings-reported', settings);
	});

	hardware.connect = function() {
		console.log('!Serial port opened');
	};

	hardware.write = function(command) {
		console.log('HARDWARE-MOCK:' + command);

        var commandParts = command.split(/\(|\)/);
        var commandText = commandParts[0];

		if (commandText === 'rcap') {
			hardware.emit('status', reader.parseStatus("CAPA:255"));
		}
        if (commandText === 'ligt') {
            hardware.emit('status', reader.parseStatus("LIGP:" + commandParts[1]/255.0));
            console.log("HARDWARE-MOCK return light status");
        }
        
        if (commandText === 'tilt') {
            hardware.emit('status', reader.parseStatus("servo:" + commandParts[1]));
            console.log("HARDWARE-MOCK return servo status");
        }
                
	};

	hardware.close = function() {
		console.log('!Serial port closed');
	};

	var time = 1000;
	setInterval(function() { 
		hardware.emit('status', reader.parseStatus('time:' + time));
		time += 1000; 
	}, 1000);

    setInterval(sendEvent,3000);
    function sendEvent() {
      var data ="vout:1023;iout:125;";
      
      var status = reader.parseStatus(data);
      hardware.emit('status',status);
    }

	return hardware;
};

module.exports = Hardware;
