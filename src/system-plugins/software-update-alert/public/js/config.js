'use strict';
var SoftwareUpdaterConfig;
SoftwareUpdaterConfig = function SoftwareUpdaterConfig() {
  var self = this;

  self.dashboardUrl = ko.observable();
  getDashboardUrl();

  self.getSelectedBranches = function (callback) {
    $.get('/system-plugin/software-update/config/selectedBranches', function (config) {
      if (callback != undefined)
        callback(config ? config : { branches: [] } );
    });
  };
  self.setSelectedBranches = function (branches) {
    $.post('/system-plugin/software-update/config/selectedBranches', branches);
  };

  self.getShowAlerts = function (callback) {
    $.get('/system-plugin/software-update/config/showAlerts', function (settings) {
      if (callback != undefined)
        callback(settings.showAlerts === "true");
    });
  };
  self.setShowAlerts = function (value) {
    $.post('/system-plugin/software-update/config/showAlerts', { showAlerts: value });
  };

  function getDashboardUrl() {
    $.get('/system-plugin/software-update/config/dashboardUrl', function(config) {
      self.dashboardUrl = config.url;
    });
  }
};