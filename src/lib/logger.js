//var OpenROV = OpenROV || {};
var CONFIG = require('./config');

function Logger(enabled) {
	this.enabled = enabled;
	this.log = function(arguments) {
		if (enabled) {
			console.log(arguments);
		}		
	}
};

Logger.create = function(enabled) {
		return new Logger(enabled);
	};

module.exports = Logger;
