'use strict';
var BatteryConfig;
BatteryConfig = function BatteryConfig() {
  var self = this;
  self.getConfig = function (callback) {
    $.get('/plugin/capestatus/', function (config) {
      if (callback != undefined)
        callback(config);
    });
  };


  // TODO Error handling


  self.addBattery = function(battery) {
    $.post('/plugin/capestatus/batteries/', battery);
  };

  self.deleteBattery = function(battery) {
    $.delete('/plugin/capestatus/batteries/', battery);
  }

  self.setSelected = function(name) {
    $.post('/plugin/capestatus/selectedBattery', { name: name });
  }
};