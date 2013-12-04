function cockpit(name, deps) {
    
	deps.io.sockets.on('connection', function (socket) {

		socket.on('status-cockpit', function(){
			deps.dashboardEngine.send({ key: 'status-cockpit' });
		});

		socket.on('start-cockpit', function() {
			deps.dashboardEngine.send({ key: 'start-cockpit' });
		});

		socket.on('stop-cockpit', function() {
			deps.dashboardEngine.send({ key: 'stop-cockpit' });
		});

	});
};

module.exports = cockpit;