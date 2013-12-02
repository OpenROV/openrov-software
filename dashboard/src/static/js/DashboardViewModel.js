function DashboardViewModel(socket){
    var viewModel = {
        cockpitStatus : ko.observable(new ProcessModel()),
        cloud9Status : ko.observable(new ProcessModel()),
        networkshareStatus : ko.observable(new ProcessModel()),

        cockpitStart : function() {
            socket.emit('start-cockpit');
        },

        cockpitStop : function() {
            socket.emit('stop-cockpit');
        }
    };

    socket.on('status-cockpit', function(status){
        viewModel.cockpitStatus().status(status);
        viewModel.cockpitStatus().running((status === "Running"));
    });

    return viewModel;
}

function ProcessModel() {
	var self = this;

	self.status = ko.observable('Unkown');
	self.running = ko.observable(false)
	return self;
}
