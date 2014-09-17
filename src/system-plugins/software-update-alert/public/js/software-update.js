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
  var SoftwareUpdateModel = function SoftwareUpdateModel(updateChecker, configManager) {
    var self = this;

    self.showAlerts = ko.observable(false);
    self.branches = ko.observableArray();
    self.isSaved = ko.observable(false);

    self.changed = function() {
      var selected = [];
      self.branches().forEach(function(branch) {
        if (branch.selected() === true) {
          selected.push(branch.name);
        }
      });
      configManager.setSelectedBranches( { branches: selected });
      self.isSaved(true);
      setTimeout(function() {self.isSaved(false)}, 2000);
      return true;
    };

    configManager.getShowAlerts(function(showAlerts){
      self.showAlerts(showAlerts)
    });

    self.showAlerts.subscribe(function(newValue){
      if (self.showAlerts()) {
        updateChecker.getBranches(function (branches) {
          configManager.getSelectedBranches(function (selectedBranches) {
            self.branches.removeAll();
            branches.forEach(function (branch) {
              var selected = selectedBranches.branches ? selectedBranches.branches : [];
              var branchConfig = selected.filter(function (b) {
                return b == branch;
              });
              self.branches.push({ name: branch, selected: ko.observable(branchConfig.length > 0)});
            });
          });
        })
      }
      configManager.setShowAlerts(self.showAlerts());
      self.isSaved(true);
      setTimeout(function() {self.isSaved(false)}, 2000);
      return true;
    });

  };

  var SoftwareUpdater = function SoftwareUpdater(cockpit) {
    var self = this;

    var configManager = new SoftwareUpdaterConfig();

    var checker = new SoftwareUpdateChecker(configManager);
    this.model = new SoftwareUpdateModel(checker, configManager);

    console.log('Loading Software update plugin.');
    this.cockpit = cockpit;

    $('#plugin-settings').append('<div id="software-update-settings"></div>');
    $('body').prepend('<div id="software-update-alert-container" class="alert alert-success hide"></div>');
    //this technique forces relative path to the js file instead of the excution directory
    var jsFileLocation = urlOfJsFile('software-update.js');
    $('#software-update-settings').load(jsFileLocation + '../settings.html', function () {
      ko.applyBindings(self.model, document.getElementById('software-update-settings'));
    });
    $('#software-update-alert-container').load(jsFileLocation + '../ui-templates.html', function () {
    });
    $('body').append('<div id="proxy-container"  class="span12"><iframe  class="span12" style="height: 300px" src="http://localhost:3000"></iframe></div>');
    $('#proxy-container').hide();

    this.model.showAlerts.subscribe(function(newValue) {
      if (newValue) {
        checker.checkForUpdates(function (updates) {
          if (updates && updates.length > 0) {
            var model = { packages: updates, dashboardUrl: configManager.dashboardUrl }
            var container = $('#software-update-alert-container');
            ko.applyBindings(model, container[0]);
            container.removeClass('hide');
          }
        });
      }
    });
  };
  window.Cockpit.plugins.push(SoftwareUpdater);
}(window, jQuery));
