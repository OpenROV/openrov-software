var EventEmitter = require('events').EventEmitter;


var DashboardEngine = function() {
	var engine = new EventEmitter();

	return engine;
}

module.exports = DashboardEngine;
