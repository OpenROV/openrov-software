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
  var SoftwareUpdateModel = function SoftwareUpdateModel(socket, updateChecker, configManger) {
    var self = this;

    self.socket = socket;
    self.showAlerts = ko.observable();
    self.branches = ko.observableArray();
    self.isSaved = ko.observable(false);

    self.changed = function() {
      var selected = [];
      self.branches().forEach(function(branch) {
        if (branch.selected() === true) {
          selected.push(branch.name);
        }
      });
      configManger.setSelectedBranches( { branches: selected });
      self.isSaved(true);
      setTimeout(function() {self.isSaved(false)}, 2000);
      return true;
    };

    self.branches.removeAll();
    updateChecker.getBranches(function(branches) {
      configManger.getSelectedBranches(function(selectedBranches) {
        branches.forEach(function (branch) {
          var selected = selectedBranches.branches ? selectedBranches.branches : [];
          var branchConfig = selected.filter(function(b) { return b == branch; });
          self.branches.push({ name: branch, selected: ko.observable(branchConfig.length > 0)});
        });

      });
    })
  };

  var SoftwareUpdater = function SoftwareUpdater(cockpit) {
    var self = this;

    var configManager = new SoftwareUpdaterConfig();
    this.dashboardSocket = window.io("http://"+window.location.hostname + ':8081/IPC');
    this.dashboardSocket.on('Software.Cockpit.answer', function(message) {
      alert(message);
    });

    var dashboardUrl= 'http://localhost:8081';
    var checker = new SoftwareUpdateChecker({dashboardUrl: dashboardUrl });
    this.model = new SoftwareUpdateModel(this.dashboardSocket, checker, configManager);

    console.log('Loading Software update plugin.');
    this.cockpit = cockpit;

    $('#plugin-settings').append('<div id="software-update-settings"></div>');
    //this technique forces relative path to the js file instead of the excution directory
    var jsFileLocation = urlOfJsFile('software-update.js');
    $('#software-update-settings').load(jsFileLocation + '../settings.html', function () {
      ko.applyBindings(self.model, document.getElementById('software-update-settings'));
    });

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
