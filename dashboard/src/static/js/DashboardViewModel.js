function OpenRovViewModel(){
    var self = this;

    self.cockpitStatus = ko.observable(new ProcessModel());
    self.cloud9Status = ko.observable(new ProcessModel());
    self.networkshareStatus = ko.observable(new ProcessModel());
}

function ProcessModel() {
	var self = this;

	self.status = ko.observable('Unkown');
	self.running = ko.observable(false)
}
