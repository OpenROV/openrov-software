function samba(name, deps) {
	deps.io.sockets.on('connection', function (socket) {

		socket.on('status-samba', function(){
			deps.dashboardEngine.send({ key: 'status-samba' });
		});

		socket.on('start-samba', function() {
			deps.dashboardEngine.send({ key: 'start-samba' });
		});

		socket.on('stop-samba', function() {
			deps.dashboardEngine.send({ key: 'stop-samba' });
		});
	});
};

module.exports = samba;