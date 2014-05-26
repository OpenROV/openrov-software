/*jshint multistr: true*/
(function (window, $, undefined) {
  'use strict';
  var Arduinofirmwareupload;
  Arduinofirmwareupload = function Arduinofirmwareupload(cockpit) {
    console.log('Loading Arduinofirmwareupload plugin in the browser.');
    // Instance variables
    this.cockpit = cockpit;
    this.arduinoFirmwareVM = new ArduinoFirmwareViewModel();
    // Add required UI elements
    $('#settings H4:contains(\'Runtime Settings:\')').append('<div class="settings-block">             <h4>Upload firmware</h4>             <div class="control-group">               Arduino firmware:               <label>                 <!--input id="arduinoFirmware" type="file"-->               </label>               <div class="alert alert-error" id="arduinoFirmware-error" data-bind="css: { hide: selectedFileName() === \'\' || isValidFirmwareFile() }">                 <button type="button" class="close" data-dismiss="alert">x</button>                 <strong>Oh snap!</strong> Only <i>.zip</i>, <i>.tar.gz</i> and <i>.ino</i> files are supported!               </div>               <div class="alert alert-error" id="file-upload-notsupported" data-bind="css: { hide: ! browserDoesSupportFileApi() }">                 <button type="button" class="close" data-dismiss="alert">x</button>                 <strong>Oh snap!</strong> Your browser doesn\'t support the file upload API!               </div>               <button href="#firmware-upload-dialog" class="btn btn-small" type="button" id="arduinoFirmware-upload" data-bind="css: { \'btn-success\': isValidFirmwareFile() == false,  \'btn-success\': isValidFirmwareFile() }" data-toggle="modal"> \t      <i class="icon-upload icon-white"></i> Upload firmware from SD card to Arduino</button>             </div>');
    $('#settings').after('<div class="modal fade" id="firmware-upload-dialog"> \t\t\t             <!-- Firmware upload -->           <div class="modal-header">             <h3>Upload Arduino Firmware</h3>           </div>           <div class="modal-body">             <strong>Filename: </strong><span data-bind="text: selectedFileName"></span>             <br>             <hr>             <div class="progress-step">               <p>Overall progress:</p>               <div class="progress progress-striped progress-success">                 <div class="bar" style="width: 0%;" data-bind="style: { width: overallPercentage() + \'%\' }"></div>               </div>             </div>             <div class="progress-step">               <p>File upload:</p>               <div class="progress progress-striped">                 <div class="bar" style="width: 0%;" data-bind="style: { width: uploadPercentage() + \'%\' }"></div>               </div>               <ul class="unstyled">                 <li data-bind="css: { muted: ! unpacking() }">Unpacking <i class="icon-fire" data-bind="visible: unpacking() && ! unpacked() "></i><i class="icon-ok" data-bind="visible: unpacked"></i> \t<i class="icon-warning-sign" data-bind="visible: unpacking() && ! unpacked() && failed()"></i></li>                 <li data-bind="css: { muted: ! compiling() }">Compiling <i class="icon-fire" data-bind="visible: compiling() && ! compiled()"></i><i class="icon-ok" data-bind="visible: compiled"></i> \t\t<i class="icon-warning-sign" data-bind="visible: compiling() && ! compiled() && failed()"></i></li><li data-bind="css: { muted: ! arduinoUploading() }">Upload to Arduino <i class="icon-fire" data-bind="visible: arduinoUploading() && ! arduinoUploaded()"></i> \t\t<i class="icon-ok" data-bind="visible: arduinoUploaded"></i><i class="icon-warning-sign" data-bind="visible: arduinoUploading() && ! arduinoUploaded() && failed()"></i></li>              </ul>             </div>             <div class="progress-step">               <a href="#" class="btn" id="arduinoFirmware-showdetails" data-bind="css: { disabled: ! inProgress() }">Show details</a>               <div class="collapse" data-bind="css: { collapse: !detailsVisible() }">                 <textarea id="arduiniFirmware-details" readonly="readonly" data-bind="text: details"></textarea>               </div>             </div>           </div>           <div class="modal-footer">             <a href="#" class="btn" data-toggle="modal" data-target="#firmware-upload-dialog" data-bind="css: { disabled: inProgress() }, visible: ! arduinoUploaded()">Cancel</a>             <a href="#" class="btn btn-primary" id="arduinoFirmware-startupload" data-bind="visible: ! arduinoUploaded()">Apply new firmware</a>             <a href="#" class="btn btn-primary" id="arduinoFirmware-closeupload" data-toggle="modal" data-target="#firmware-upload-dialog" data-bind="visible: arduinoUploaded() || failed()">Close</a>           </div>         </div>');
    ko.applyBindings(this.arduinoFirmwareVM);
    var self = this;
    /* ------------------------------------------
               firmware upload
            */
    var selectedFile;
    var fileReader = new FileReader();
    $('#arduinoFirmware').live('change', function (evnt) {
      selectedFile = evnt.target.files[0];
      self.selectedFile(selectedFile);
    });
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
    this.arduinoFirmwareVM.details.subscribe(function (data) {
      $('#arduiniFirmware-details').scrollTop($('#arduiniFirmware-details')[0].scrollHeight);
    });
    // Register the various event handlers
    this.listen();
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
