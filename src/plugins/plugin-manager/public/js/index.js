(function (window, $, undefined) {
  'use strict';

  var PluginManagerModel = function PluginManagerModel() {
    var self = this;
    self.controlablePlugins = ko.observableArray();
    self.enablePlugin = function(plugin) {
      if (plugin.isEnabled()) return;
      plugin.isEnabled(true);
      plugin.enable();
    };

    self.disablePlugin = function(plugin) {
      if (!plugin.isEnabled()) return;
      plugin.isEnabled(false);
      plugin.disable();
    };
  }

  var PluginManager;
  PluginManager = function PluginManager(cockpit) {
    console.log('Loading Plugin Manager plugin.');
    this.cockpit = cockpit;
    this.model = new PluginManagerModel();
    var self = this;

    $('#settings #plugin-settings').append('<div id="plugin-manager-settings"></div>');
    $('#plugin-manager-settings').load('plugin/plugin-manager/settings.html',
      function() {
        cockpit.loadedPlugins.forEach(function (plugin) {
          plugin.isEnabled = ko.observable(true);
          if (plugin.canBeDisabled) { self.model.controlablePlugins.push(plugin); }
        });
        ko.applyBindings(self.model, document.getElementById("pluginManager-settings"));

      });
  };
  window.Cockpit.plugins.push(PluginManager);
}(window, jQuery));