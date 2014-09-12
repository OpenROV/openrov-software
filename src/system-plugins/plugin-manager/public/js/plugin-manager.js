(function (window, $, undefined) {
  'use strict';
  String.prototype.toBool = function () {
    switch (this.toLowerCase()) {
    case 'false':
    case 'no':
    case '0':
    case '':
      return false;
    default:
      return true;
    }
  };
  var PluginManagerModel = function PluginManagerModel() {
    var self = this;
    self.controlablePlugins = ko.observableArray();
    self.enablePlugin = function (plugin) {
      if (plugin.isEnabled())
        return;
      plugin.isEnabled(true);
    };
    self.disablePlugin = function (plugin) {
      if (!plugin.isEnabled())
        return;
      plugin.isEnabled(false);
    };
  };
  var Plugin = function Plugin(rawPlugin, configManager) {
    var self = this;
    self.rawPlugin = rawPlugin;
    self.config = {};
    self.isEnabled = ko.observable(typeof  self.rawPlugin.defaultEnabled !== "undefined" ? self.rawPlugin.defaultEnabled : 1);
    self.name = ko.computed(function () {
      return self.rawPlugin.name;
    });
    self.viewName = ko.computed(function () {
      return self.rawPlugin.viewName;
    });
    //Get data from server
    configManager.get(self.name(), function (pluginConfig) {
      if (pluginConfig != undefined && pluginConfig.isEnabled != undefined) {
        self.config = pluginConfig;
        self.isEnabled(pluginConfig.isEnabled.toBool());
      }
    });
    //Update data to server when changed
    self.isEnabled.subscribe(function (newIsEnabled) {
      if (newIsEnabled == true) {
        self.rawPlugin.enable();
      } else {
        self.rawPlugin.disable();
      }
      self.config.isEnabled = newIsEnabled.toString();
      configManager.set(self.name(), self.config);
    });
  };
  var PluginManager = function PluginManager(cockpit) {
    console.log('Loading Plugin Manager plugin.');
    this.cockpit = cockpit;
    this.model = new PluginManagerModel();
    var self = this;
    var configManager = new PluginManagerConfig();
    $('#plugin-settings').append('<div id="plugin-manager-settings"></div>');
    //this technique forces relative path to the js file instead of the excution directory
    var jsFileLocation = urlOfJsFile('plugin-manager.js');
    $('#plugin-manager-settings').load(jsFileLocation + '../settings.html', function () {
      cockpit.loadedPlugins.forEach(function (plugin) {
        console.log('evaluating plugin for pluginmanager');
        if (plugin.canBeDisabled) {
          self.model.controlablePlugins.push(new Plugin(plugin, configManager));
        }
      });
      ko.applyBindings(self.model, document.getElementById('pluginManager-settings'));
    });
  };
  window.Cockpit.plugins.push(PluginManager);
}(window, jQuery));
