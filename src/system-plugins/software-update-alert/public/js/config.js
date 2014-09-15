'use strict';
var SoftwareUpdaterConfig;
SoftwareUpdaterConfig = function SoftwareUpdaterConfig() {
  var self = this;
  self.getSelectedBranches = function (callback) {
    $.get('/system-plugin/software-update/config/selectedBranches', function (config) {
      if (callback != undefined)
        callback(config ? config : { branches: [] } );
    });
  };
  self.setSelectedBranches = function (branches) {
    $.post('/system-plugin/software-update/config/selectedBranches', branches);
  };
};