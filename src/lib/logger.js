function Logger(config) {
	this.log = function(arguments) {
		if (config.debug) {
			console.log(arguments);
		}		
	}

	this.command = function(arguments) {
		if (config.debug_commands) {
			console.error("command", command);
		}
	}
};

Logger.create = function(config) {
		return new Logger(config);
	};

module.exports = Logger;
