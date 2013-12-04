var serialPort = require('serialport')
  , EventEmitter = require('events').EventEmitter
  , StatusReader = require('./StatusReader')
  , CONFIG = require('./config');

function Hardware() {
	var hardware = new EventEmitter();
	var reader = new StatusReader();
	hardware.serial = { };

	reader.on('Arduino-settings-reported', function(settings) {
		hardware.emit('Arduino-settings-reported', settings);
	});

	hardware.connect = function() {
		hardware.serial = new serialPort.SerialPort(
		CONFIG.serial, 
		{
			baudrate: CONFIG.serial_baud,
			parser: serialPort.parsers.readline("\r\n")
		});
        
        hardware.serial.on( 'close', function (data) {
         logger.log('!Serial port closed');
        });

		hardware.serial.on( 'data', function( data ) {
			var status = reader.parseStatus(data);
			hardware.emit('status', status);
		});
	};

	hardware.write = function(command) {
		logger.command(command);

		if(CONFIG.production) {
			hardware.serial.write(command);
		}
	};

	hardware.close = function() {
		hardware.serial.close();
	};
	return hardware;
};

module.exports = Hardware;
