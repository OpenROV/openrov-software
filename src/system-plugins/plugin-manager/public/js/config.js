'use strict';
var PluginManagerConfig;
PluginManagerConfig = function PluginManagerConfig() {
  var self = this;
  self.get = function (pluginName, callback) {
    $.get('/system-plugin/plugin-manager/config/' + pluginName, function (config) {
      if (callback != undefined)
        callback(config);
    });
  };
  self.set = function (pluginName, config) {
    $.post('/system-plugin/plugin-manager/config/' + pluginName, config);
  };
};