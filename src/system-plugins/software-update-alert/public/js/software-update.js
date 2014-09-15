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

    var dashboardUrl= 'http://localhost:8081';
    var checker = new SoftwareUpdateChecker({dashboardUrl: dashboardUrl });
    checker.checkForUpdates(function(updates) {
      if (updates && updates.length > 0) {
        $('body')
          .prepend(
            '<div id="softwareUpdateAlert" class="alert alert-success pull-right" >' +
            '<button type="button" class="close" data-dismiss="alert">&times;</button>' +
            '<strong>Software updates!</strong> ' +
              '<a href="' + dashboardUrl + '/#/software" target="_blank" onclick="$(\'#softwareUpdateAlert\').alert(\'close\')">' +
              'There is new software available</a>' +
            '</div>');
      }
    });
  };
  window.Cockpit.plugins.push(SoftwareUpdater);
}(window, jQuery));
