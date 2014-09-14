(function (window, $, undefined) {
  'use strict';
  String.prototype.toBool = function () {
    switch (this.toLowerCase()) {
    case 'false':
    case 'no':
    case '0':
    case '':
      return false;
    default:
      return true;
    }
  };
  var SoftwareUpdateModel = function SoftwareUpdateModel(socket) {
    var self = this;
    self.socket = socket;
    self.showAlerts = ko.observable();
    self.branches = ko.observableArray();
    self.send = function() { self.socket.emit('Software.Cockpit.message', 'hello');}
  };
  var SoftwareUpdater = function SoftwareUpdater(cockpit) {
    var self = this;

    this.dashboardSocket = window.io("http://"+window.location.hostname + ':8081/IPC');
    this.dashboardSocket .on('connect', function () {
      alert('connect');
      self.dashboardSocket.emit('Software.Cockpit.message', 'hello');
    });
    this.dashboardSocket.on('Software.Cockpit.answer', function(message) {
      alert(message);
    });
    this.model = new SoftwareUpdateModel(this.dashboardSocket);

    console.log('Loading Software update plugin.');
    this.cockpit = cockpit;

    var configManager = new SoftwareUpdaterConfig();
    $('#plugin-settings').append('<div id="software-update-settings"></div>');
    //this technique forces relative path to the js file instead of the excution directory
    var jsFileLocation = urlOfJsFile('software-update.js');
    $('#software-update-settings').load(jsFileLocation + '../settings.html', function () {
      ko.applyBindings(self.model, document.getElementById('software-update-settings'));
    });
  };
  window.Cockpit.plugins.push(SoftwareUpdater);
}(window, jQuery));
