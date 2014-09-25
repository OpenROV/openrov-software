(function (window, $, undefined) {
  'use strict';

  function SoftwareUpdateChecker(config) {
    var self = this;

    self.getBranches = function(callback) {
      setTimeout(function() {
        $.get(config.dashboardUrl() + "/plugin/software/branches", callback );
      }, 3000);
    };

    self.checkForUpdates = function(callback){
      config.getSelectedBranches(function(selectedBranches){
alert(JSON.stringify(selectedBranches));
        $.post(config.dashboardUrl() + "/plugin/software/updates", selectedBranches,
        function(updates) {
          callback(updates);
        }, 'application/json');
      });
      return { updates: false }
    };

    return self;
  }
  window.SoftwareUpdateChecker = SoftwareUpdateChecker;

}(window, jQuery));
