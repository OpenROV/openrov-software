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
	};

	hardware.write = function(command) {
		console.log('HARDWARE-MOCK:' + command);

		if (command === 'rcap();') {
			hardware.emit('status', reader.parseStatus("CAPA:255"));
		}
	};

	hardware.close = function() {
		logger.log('!Serial port closed');
	};

	var time = 1000;
	setInterval(function() { 
		hardware.emit('status', reader.parseStatus('time:' + time));
		time += 1000; 
	}, 1000);

    setInterval(sendEvent,3000);
    function sendEvent() {
      var data ="vout:1023";
      var status = reader.parseStatus(data);
      hardware.emit('status',status);
    }



	return hardware;
};

module.exports = Hardware;
