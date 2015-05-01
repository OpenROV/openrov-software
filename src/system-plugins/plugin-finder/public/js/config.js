(function() {
'use strict';
  window.Plugins = window.Plugins || { PluginFinder: {} };
  window.Plugins.PluginFinder = window.Plugins.PluginFinder || { };
  window.Plugins.PluginFinder.Config = function () {
  var self = this;
  self.get = function (pluginName, callback) {
    $.get('/system-plugin/plugin-finder/config/' + pluginName, function (config) {
      if (callback !== undefined)
        callback(config);
    });
  };
  self.set = function (pluginName, config) {
    $.post('/system-plugin/plugin-finder/config/' + pluginName, config);
  };
};
})();