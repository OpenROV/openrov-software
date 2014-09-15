(function (window, $, undefined) {
  'use strict';

  function SoftwareUpdateChecker(config) {
    var self = this;

    self.getBranches = function(callback) {
      $.get(config.dashboardUrl + "/plugin/software/branches", callback );
    };

    self.checkForUpdates = function(callback){
      config.getSelectedBranches(function(selectedBranches){
        $.post(config.dashboardUrl + "/plugin/software/updates", selectedBranches,
        function(updates) {
          callback(updates);
        });
      });
      return { updates: false }
    };

    return self;
  }
  window.SoftwareUpdateChecker = SoftwareUpdateChecker;

}(window, jQuery));
