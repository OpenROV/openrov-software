function cockpit(name, deps) {
    
	deps.io.sockets.on('connection', function (socket) {

		socket.on('status-cockpit', function(){
			deps.dashboardEngine.emit('signal', { key: 'status-cockpit' });
		});

		socket.on('start-cockpit', function() {
			deps.dashboardEngine.emit('signal', { key: 'start-cockpit' });
		});

		socket.on('stop-cockpit', function() {
			deps.dashboardEngine.emit('signal', { key: 'stop-cockpit' });
		});

	});
};

module.exports = cockpit;