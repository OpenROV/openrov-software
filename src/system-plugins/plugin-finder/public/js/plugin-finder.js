(function (window, $, undefined) {
  'use strict';

  var PluginFinderModel = function PluginFinderrModel() {
    var self = this;
    self.cachedAvailablePlugins = [];
    self.availablePlugins = ko.observableArray();
    self.query = ko.observable('');

    self.query.subscribe(function(value) {
        // remove all the current beers, which removes them from the view
        self.availablePlugins.removeAll();

        for(var x in self.cachedAvailablePlugins) {
          if(self.cachedAvailablePlugins[x].name().toLowerCase().indexOf(value.toLowerCase()) >= 0) {
            self.availablePlugins.push(self.cachedAvailablePlugins[x]);
          }
        }
      }
    );
  };


  var Plugin = function Plugin(rawPlugin, configManager) {
    var self = this;
    self.rawPlugin = rawPlugin;
    self.config = {};
    self.isEnabled = ko.observable(true);
    self.name = ko.computed(function () {
      return self.rawPlugin.name;
    });
    self.url = ko.computed(function () {
      return self.rawPlugin.url;
    });
    //Get data from server
    /*configManager.get(self.name(), function (pluginConfig) {
      if (pluginConfig != undefined && pluginConfig.isEnabled != undefined) {
        self.config = pluginConfig;
        self.isEnabled(pluginConfig.isEnabled.toBool());
      }
    });*/
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



  var PluginFinder = function PluginFinder(cockpit) {
    console.log('Loading Plugin Finder plugin.');
    this.cockpit = cockpit;
    this.model = new PluginFinderModel();
    var self = this;
    var configManager = new PluginFinderConfig();
    $('#plugin-settings').append('<div id="plugin-finder-settings"></div>');
    //this technique forces relative path to the js file instead of the excution directory
    var jsFileLocation = urlOfJsFile('plugin-finder.js');
    $('#plugin-finder-settings').load(jsFileLocation + '../settings.html', function () {
      //Get plugins from somewhere and bind them somewhere
      ko.applyBindings(self.model, document.getElementById('pluginFinder-settings'));
    });

    self.cockpit.socket.on('pluginfindersearchresults', function(results){
      console.log('evaluating plugin for pluginmanager');
      results.forEach(function (plugin) {
        var plg = new Plugin(plugin, configManager);
        self.model.availablePlugins.push(plg);
        self.model.cachedAvailablePlugins.push(plg)
      });

    });
  };
  window.Cockpit.plugins.push(PluginFinder);
}(window, jQuery));
