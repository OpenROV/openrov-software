'use strict';
var PluginFinderConfig;
PluginFinderConfig = function PluginFinderConfig() {
  var self = this;
  self.get = function (pluginName, callback) {
    $.get('/system-plugin/plugin-finder/config/' + pluginName, function (config) {
      if (callback != undefined)
        callback(config);
    });
  };
  self.set = function (pluginName, config) {
    $.post('/system-plugin/plugin-finder/config/' + pluginName, config);
  };
};
