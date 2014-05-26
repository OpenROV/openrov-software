function ArduinoFirmwareViewModel() {
  var self = this;
  var numberOfSteps = 6;
  self.stepsDone = ko.observable(0);
  self.selectedFile = ko.observable();
  self.uploadPercentage = ko.observable(0);
  self.uploaded = ko.observable(false);
  self.unpacking = ko.observable(false);
  self.unpacked = ko.observable(false);
  self.compiling = ko.observable(false);
  self.compiled = ko.observable(false);
  self.arduinoUploading = ko.observable(false);
  self.arduinoUploaded = ko.observable(false);
  self.detailsVisible = ko.observable(false);
  self.details = ko.observable();
  self.failed = ko.observable(false);
  self.reset = function () {
    self.stepsDone(0);
    self.selectedFile('');
    self.uploadPercentage(0);
    self.uploaded(false);
    self.unpacked(false);
    self.unpacking(false);
    self.compiling(false);
    self.compiled(false);
    self.arduinoUploading(false);
    self.arduinoUploaded(false);
    self.detailsVisible(false);
    self.details('');
    self.failed(false);
  };
  self.selectedFileName = ko.computed(function () {
    if (self.selectedFile()) {
      return self.selectedFile().name;
    }
    return '';
  });
  self.isValidFirmwareFile = ko.computed(function () {
    var fileName = self.selectedFileName();
    var ext = fileName.split('.').pop().toLowerCase();
    return $.inArray(ext, [
      'zip',
      'ino',
      'gz'
    ]) != -1;
  });
  self.browserDoesSupportFileApi = ko.computed(function () {
    return !(window.File && window.FileReader);
  });
  self.overallPercentage = ko.computed(function () {
    var percentage = 100 / numberOfSteps * self.stepsDone();
    console.log('percentage: ' + numberOfSteps + ' done: ' + self.stepsDone());
    return percentage;
  });
  self.inProgress = ko.computed(function () {
    return self.stepsDone() !== 0;
  });
  self.updateStatus = function (data) {
    if (data.errorMessage) {
      self.failed(true);
      return;
    }
    if (self[self.lastStatus]) {
      self[self.lastStatus](false);
    }
    self[data.key](true);
    self.stepsDone(self.stepsDone() + 1);
  };
  self.toggleDetails = function () {
    if (self.detailsVisible()) {
      self.detailsVisible(false);
    } else {
      self.detailsVisible(true);
    }
  };
  self.logOutput = function (data) {
    self.details(self.details() + data);
  };
}
