function MockViewModel(socket) {
	var viewModel = {
		requestCockpitStatus : function() {
			socket.emit('status-cockpit');
		},
		stopCockpit : function() {
			socket.emit('stop-cockpit');
		},
		startCockpit : function() {
			socket.emit('start-cockpit');
		},
		statusCockpit : ko.observable("Unknown"),

		requestCloud9Status : function() {
			socket.emit('status-cloud9');
		},
		stopCloud9 : function() {
			socket.emit('stop-cloud9');
		},
		startCloud9 : function() {
			socket.emit('start-cloud9');
		},
		statusCloud9 : ko.observable("Unknown"),

		requestSambaStatus : function() {
			socket.emit('status-samba');
		},
		stopSamba : function() {
			socket.emit('stop-samba');
		},
		startSamba : function() {
			socket.emit('start-samba');
		},
		statusSamba : ko.observable("Unknown"),
	};

	socket.on('status-cockpit', function(status) {
		viewModel.statusCockpit(status);
	});
	socket.on('status-cloud9', function(status) {
		viewModel.statusCloud9(status);
	});
	socket.on('status-samba', function(status) {
		viewModel.statusSamba(status);
	});


	return viewModel;
}