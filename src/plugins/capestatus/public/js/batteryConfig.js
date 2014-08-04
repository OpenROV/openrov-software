/*jshint -W117 */ // for $ of jQuery
(function () {
  'use strict';
  var capestatus = namespace('plugins.capestatus');
  capestatus.BatteryConfig = function BatteryConfig() {
    var self = this;
    self.getConfig = function (callback) {
      $.get('/plugin/capestatus/', function (config) {
        if (callback !== undefined)
          callback(config);
      });
    };


    // TODO Error handling

    self.addBattery = function(battery) {
      $.post('/plugin/capestatus/batteries/', battery);
    };

    self.deleteBattery = function(battery) {
      $.ajax({
        url: '/plugin/capestatus/batteries/',
        type: 'DELETE',
        dataType: 'json',
        data: battery
      });
    };

    self.setSelected = function(name) {
      $.post('/plugin/capestatus/selectedBattery', { name: name });
    };
  };
}());