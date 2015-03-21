/*jshint multistr: true*/
(function (window, $, undefined) {
  'use strict';
  var Arduinofirmwareupload;
  Arduinofirmwareupload = function Arduinofirmwareupload(cockpit) {
    console.log('Loading Arduinofirmwareupload plugin in the browser.');
    // Instance variables
    this.cockpit = cockpit;
    this.arduinoFirmwareVM = new ArduinoFirmwareViewModel();
    var self = this;
    // Add required UI elements

    //this technique forces relative path to the js file instead of the excution directory
    var jsFileLocation = urlOfJsFile('arduinofirmwareupload.js');

    this.cockpit.extensionPoints.rovSettings
      .append('<div id="firmware-settings">');

    var firmwareSettings = this.cockpit.extensionPoints.rovSettings.find('#firmware-settings');
      firmwareSettings.load(
        jsFileLocation + '../settings.html',
        function() {
          ko.applyBindings(self.arduinoFirmwareVM, firmwareSettings[0]);
        });
    $('body').append('</div><div id="firmware-modal"></div>');
    var firmwareModal = $('#firmware-modal');
      firmwareModal.load(
        jsFileLocation + '../modal.html',
        function() {
          ko.applyBindings(self.arduinoFirmwareVM, firmwareModal[0]);

          var button =firmwareSettings.find('#arduinoFirmware-upload');
          button.click(function() {
            firmwareModal.find('#firmware-upload-dialog').modal('show');
          });

          firmwareModal.find('#arduinoFirmware-startupload').click(function () {
            self.cockpit.rov.emit('plugin.arduinoFirmwareUpload.install');
          });
          firmwareModal.find('#arduinoFirmware-closeupload').click(function () {
            self.arduinoFirmwareVM.reset();
          });
          firmwareModal.find('#arduinoFirmware-showdetails').click(function () {
            self.arduinoFirmwareVM.toggleDetails();
          });
        });

    /* ------------------------------------------
               firmware upload
            */

    this.arduinoFirmwareVM.details.subscribe(function (data) {
      firmwareModal.find('#arduiniFirmware-details').scrollTop(
        firmwareModal.find('#arduiniFirmware-details')[0].scrollHeight);
    });
  };
  //This pattern will hook events in the cockpit and pull them all back
  //so that the reference to this instance is available for further processing
  Arduinofirmwareupload.prototype.listen = function listen() {
    var arduinofirmware = this;
    this.cockpit.extensionPoints.rovSettings.registerCloseHandler(function () {
      arduinofirmware.SaveSettings();
    });
    this.cockpit.rov.on('settings', function (data) {
      arduinofirmware.LoadSettings(data);
    });
    this.cockpit.rov.on('arduinofirmware-uploaddone', function (data) {
      arduinofirmware.arduinoFirmwareVM.uploaded(true);
      arduinofirmware.arduinoFirmwareVM.uploadPercentage(100);
    });
    this.cockpit.rov.on('plugin.arduinoFirmwareUpload.status', function (data) {
      arduinofirmware.arduinoFirmwareVM.updateStatus(data);
    });
    this.cockpit.rov.on('plugin.arduinoFirmwareUpload.output', function (data) {
      arduinofirmware.arduinoFirmwareVM.logOutput(data);
    });
  };
  Arduinofirmwareupload.prototype.LoadSettings = function LoadSettings(settings) {
  };
  Arduinofirmwareupload.prototype.SaveSettings = function SaveSettings() {
  };
  window.Cockpit.plugins.push(Arduinofirmwareupload);
}(window, jQuery));
function ArduinoFirmwareViewModel() {
  var self = this;
  var numberOfSteps = 6;
  self.stepsDone = ko.observable(0);
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
