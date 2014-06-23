function ProcessModel() {
  var self = this;
  self.status = ko.observable('Unknown');
  self.startable = ko.computed(function () {
    return self.status() === 'Stopped';
  }, self);
  self.stopable = ko.computed(function () {
    return self.status() === 'Running';
  }, self);
  return self;
}
ProcessModel.prototype.requestStatus = function () {
};
ProcessModel.prototype.start = function () {
};
ProcessModel.prototype.stop = function () {
};
