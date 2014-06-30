(function (window, $, undefined) {
  'use strict';

  var PluginManagerModel = function PluginManagerModel() {
    var self = this;
    self.controlablePlugins = ko.observableArray();
    self.enablePlugin = function(plugin) {
      if (plugin.isEnabled()) return;
      plugin.isEnabled(true);
    };

    self.disablePlugin = function(plugin) {
      if (!plugin.isEnabled()) return;
      plugin.isEnabled(false);
    };
  }

  var PluginManager;
  PluginManager = function PluginManager(cockpit) {
    console.log('Loading Plugin Manager plugin.');
    this.cockpit = cockpit;
    this.model = new PluginManagerModel();
    var self = this;
    var config = new PluginManagerConfig();

    $('#settings #plugin-settings').append('<div id="plugin-manager-settings"></div>');
    $('#plugin-manager-settings').load('plugin/plugin-manager/settings.html',
      function() {
        cockpit.loadedPlugins.forEach(function (plugin) {
          // TODO: needs to be put into a  wrapping object for cleanes
          plugin.isEnabled = ko.observable(true);

          plugin.isEnabled.subscribe(function(newIsEnabled) {
            if (newIsEnabled == true) { plugin.enable(); }
            else { plugin.disable(); }
            if (plugin.config.isEnabled != newIsEnabled) {
              plugin.config.isEnabled = newIsEnabled;
              config.set(plugin.name, plugin.config);
            }
          });

          if (plugin.canBeDisabled) {
            self.model.controlablePlugins.push(plugin);
            config.get(plugin.name, function(pluginConfig) {
              if (pluginConfig != undefined && pluginConfig.isEnabled != undefined ) {
                plugin.config = pluginConfig;
                plugin.isEnabled(pluginConfig.isEnabled);
              }
            })
          }
        });
        ko.applyBindings(self.model, document.getElementById("pluginManager-settings"));

      });
  };
  window.Cockpit.plugins.push(PluginManager);
}(window, jQuery));