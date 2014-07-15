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

    $('#settings')
      .find('#plugin-settings')
      .append('<div id="firmware-settings"></div>');
    $('#firmware-settings')
      .load(
        jsFileLocation + '../settings.html',
        function() {
          ko.applyBindings(self.arduinoFirmwareVM, document.getElementById("firmware-settings"));
        });
    $('#settings').after('<div id="firmware-modal"></div>');
    $('#firmware-modal')
      .load(
        jsFileLocation + '../modal.html',
        function() {
          ko.applyBindings(self.arduinoFirmwareVM, document.getElementById("firmware-modal"));

          $('#arduinoFirmware-startupload').click(function () {
            fileReader.onload = function (evnt) {
              console.log('Upload event: ' + selectedFile.name);
              self.cockpit.socket.emit('arduinofirmware-upload', {
                'filename': selectedFile.name,
                data: evnt.target.result
              });
            };
            if (!selectedFile) {
              selectedFile = {};
              selectedFile.name = 'fromSource';
              self.cockpit.socket.emit('arduinofirmware-uploadfromsource');
            }
            console.log('Starting upload: ' + selectedFile.name);
            self.cockpit.socket.emit('arduinofirmware-startupload', {
              'filename': selectedFile.name,
              'size': selectedFile.size
            });
            selectedFile = null;
          });
          $('#arduinoFirmware-closeupload').click(function () {
            self.arduinoFirmwareVM.reset();  //$('#firmware-upload-dialog').modal('hide');
          });
          $('#arduinoFirmware-showdetails').click(function () {
            self.arduinoFirmwareVM.toggleDetails();
          });
        });

    /* ------------------------------------------
               firmware upload
            */
    var selectedFile;
    var fileReader = new FileReader();
    $('#arduinoFirmware').live('change', function (evnt) {
      selectedFile = evnt.target.files[0];
      self.selectedFile(selectedFile);
    });

    this.arduinoFirmwareVM.details.subscribe(function (data) {
      $('#arduiniFirmware-details').scrollTop($('#arduiniFirmware-details')[0].scrollHeight);
    });
  };
  //This pattern will hook events in the cockpit and pull them all back
  //so that the reference to this instance is available for further processing
  Arduinofirmwareupload.prototype.listen = function listen() {
    var arduinofirmware = this;
    $('#diagnostic .back-button').click(function () {
      arduinofirmware.SaveSettings();
    });
    this.cockpit.socket.on('settings', function (data) {
      arduinofirmware.LoadSettings(data);
    });
    this.cockpit.socket.on('arduinofirmware-requestmoredata', function (data) {
      arduinofirmware.arduinoFirmwareVM.uploadPercentage(data.Percent);
      var Place = data.Place * 524288;
      //The Next Blocks Starting Position
      var NewFile;
      //The Variable that will hold the new Block of Data
      if (selectedFile.slice !== undefined) {
        NewFile = selectedFile.slice(Place, Place + Math.min(524288, selectedFile.size - Place));
      } else if (selectedFile.webkitSlice !== undefined) {
        NewFile = selectedFile.webkitSlice(Place, Place + Math.min(524288, selectedFile.size - Place));
      }
      fileReader.readAsBinaryString(NewFile);
    });
    this.cockpit.socket.on('arduinofirmware-uploaddone', function (data) {
      arduinofirmware.arduinoFirmwareVM.uploaded(true);
      arduinofirmware.arduinoFirmwareVM.uploadPercentage(100);
    });
    this.cockpit.socket.on('arduinoFirmware-status', function (data) {
      arduinofirmware.arduinoFirmwareVM.updateStatus(data);
    });
    this.cockpit.socket.on('arduinoFirmware-output', function (data) {
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
