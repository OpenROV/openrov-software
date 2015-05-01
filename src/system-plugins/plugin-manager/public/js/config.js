(function() {
  'use strict';

  window.Plugins = window.Plugins || { PluginManager: {} };
  window.Plugins.PluginManager = window.Plugins.PluginManager || { };
  window.Plugins.PluginManager.Config = function () {
    var self = this;
    self.get = function (pluginName, callback) {
      $.get('/system-plugin/plugin-manager/config/' + pluginName, function (config) {
        if (callback !== undefined)
          callback(config);
      });
    };
    self.set = function (pluginName, config) {
      $.post('/system-plugin/plugin-manager/config/' + pluginName, config);
    };
  };
})();