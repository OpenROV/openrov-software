var serialnumberNs = namespace('pluginlugin.serialnumber');
serialnumberNs.Config = function() {
  'use strict';
  var self = this;
  self.getSerials = function (callback) {
    $.get('/plugin/serialnumber/config/', function (data) {
      if (callback != undefined)
        callback(data);
    });
  };
  self.setRovSerial = function (serial, success) {
    $.post('/plugin/serialnumber/config/rov/' + serial, success);
  };
};