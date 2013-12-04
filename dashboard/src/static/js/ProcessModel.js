function ProcessModel() {
    var self = this;
    self.status = ko.observable('Unknown');
    self.running = ko.observable(false);
    return self;
}
ProcessModel.prototype.requestStatus = function() {  };
ProcessModel.prototype.start = function() { };
ProcessModel.prototype.stop = function() { };
    
