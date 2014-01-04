var serialPort = require('serialport')
  , EventEmitter = require('events').EventEmitter
  , StatusReader = require('./StatusReader')
  , CONFIG = require('./config')
  , logger = require('./logger').create(CONFIG);

function Hardware() {
	var hardware = new EventEmitter();
	var reader = new StatusReader();
	this.serialConnected = false;
	this.emitRawSerialData = true;
	hardware.serial = { };
	var self = this;	
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
	 self.serialConnected = false;
        });
        
        var self=this;
		hardware.serial.on( 'data', function( data ) {
			var status = reader.parseStatus(data);
			hardware.emit('status', status);
			if (true) hardware.emit('serial-recieved', data + '\n');
		});
		self.serialConnected = true;
	};

	hardware.write = function(command) {
		logger.command(command);

		if(CONFIG.production && self.serialConnected) {
			hardware.serial.write(command);
			if (this.emitRawSerialData) hardware.emit('serial-sent', command);			
		}
	};
	
	hardware.toggleRawSerialData = function toggleRawSerialData(){
	    this.emitRawSerialData = !this.emitRawSerialData;
	}

	hardware.close = function() {
		hardware.serial.close();
		self.serialConnected = false;
	};
	return hardware;
};

module.exports = Hardware;
