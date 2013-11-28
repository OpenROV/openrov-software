function DashboardViewModel(socket){
    var self = this;

    self.cockpitStatus = ko.observable(new ProcessModel());
    self.cloud9Status = ko.observable(new ProcessModel());
    self.networkshareStatus = ko.observable(new ProcessModel());

    socket.on('status-cockpit', function(status){
    	self.cockpitStatus().status(status);
    	self.cockpitStatus().running((status === "Running"));
    });
    return self;
}

function ProcessModel() {
	var self = this;

	self.status = ko.observable('Unkown');
	self.running = ko.observable(false)
	return self;
}
