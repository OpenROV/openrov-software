var auxServoNs = namespace('pluginlugin.auxServo');
auxServoNs.Settings = function() {
  'use strict';
  var self = this;
  self.get = function (servo, callback) {
    $.get('/plugin/aux-servo/config/' + servo, function (config) {
      if (callback != undefined)
        callback(config);
    });
  };
  self.set = function (servo, config) {
    $.post('/plugin/aux-servo/config/' + servo, config);
  };
};