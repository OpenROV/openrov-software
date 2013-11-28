function MockViewModel(socket) {
	var viewModel = {
		requestCockpitStatus : function() {
			//alert('connected');
			socket.emit('status-cockpit');
		},
		stopCockpit : function() {
			socket.emit('stop-cockpit');
		},
		startCockpit : function() {
			socket.emit('start-cockpit');
		},
		statusCockpit : ko.observable("Unknown")
	};

	socket.on('status-cockpit', function(status) {
		viewModel.statusCockpit(status);
	});


	return viewModel;
}