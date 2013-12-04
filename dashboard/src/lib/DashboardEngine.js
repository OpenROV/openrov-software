var EventEmitter = require('events').EventEmitter
  , spawn = require('child_process').spawn;



var DashboardEngine = function() {
	var engine = new EventEmitter();

	var plugins = [ 'cockpit', 'cloud9', 'samba' ];

	engine.on('signal', function(message){

		plugins.forEach(function(plugin){
			var statusKey = 'status-' + plugin;
			if (message.key == statusKey) {
			    status = spawn('sh', [__dirname + '/../../../linux/dashboard/' +statusKey +'.sh']);

			    status.on('close', function (code) {
			    	 if (code === 0) {
			    	 	engine.emit('message', { key: statusKey, value: 'Running'})
			    	 }
			    	 else if (code === 1) {
			    	 	engine.emit('message', { key: statusKey, value: 'Stoped'})
			    	 }
			    	 else {
			    	 	engine.emit('message', { key: statusKey, value: 'Unknow'})
			    	 }
				});
			}

			var startKey = 'start-' + plugin;
			if (message.key == startKey) {
			    start = spawn('sh', [__dirname + '/../../../linux/dashboard/' +startKey +'.sh']);
			}

			var stopKey = 'stop-' + plugin;
			if (message.key == stopKey) {
			    start = spawn('sh', [__dirname + '/../../../linux/dashboard/' +stopKey +'.sh']);
			}

		});
	})



	return engine;
}

module.exports = DashboardEngine;
