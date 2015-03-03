(function (window, $, undefined) {
  'use strict';

  $.postJSON = function(url, data, callback) {
    return jQuery.ajax({
      'type': 'POST',
      'url': url,
      'contentType': 'application/json',
      'data': JSON.stringify(data),
      'dataType': 'json',
      'success': callback
    });
  };

  function SoftwareUpdateChecker(config) {
    var self = this;

    self.checkForUpdates = function(callback){
      $.get(
        config.dashboardUrl() + "/plugin/software/updates/openrov-rov-*",
        function(updates) {
          callback(updates);
        });
      return { updates: false }
    };

    return self;
  }
  window.SoftwareUpdateChecker = SoftwareUpdateChecker;

}(window, jQuery));
