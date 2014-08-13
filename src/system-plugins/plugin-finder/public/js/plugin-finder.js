(function (window, $, undefined) {
  'use strict';

  var PluginFinderModel = function PluginFinderrModel() {
    var self = this;
    self.cachedAvailablePlugins = [];
    self.availablePlugins = ko.observableArray();
    self.query = ko.observable('');
    self.isLoading = ko.observable(false);
    self.isInstalling = ko.observable(false);
    self.install = ko.observable('');
    self.uninstall = ko.observable('');
    self.requestedPluginDetail = ko.observable('');

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

    self.installPlugin = function (plugin) {
      self.install(plugin);
    };

    self.uninstallPlugin = function (plugin) {
      self.uninstall(plugin);
    };

    self.launchPluginDetail = function (plugin) {
      self.requestedPluginDetail(plugin);
    };

  };


  //
  // Custom Binding
  //
  ko.bindingHandlers.loadingWhen = {
      init: function (element) {
          var
              $element = $(element),
              currentPosition = $element.css("position"),
              $loader = $("<div>").addClass("loader").hide();

          //add the loader
          $element.append($loader);

          //make sure that we can absolutely position the loader against the original element
          if (currentPosition == "auto" || currentPosition == "static")
              $element.css("position", "relative");

          //center the loader
          $loader.css({
              position: "absolute",
              top: "50%",
              left: "50%",
              "margin-left": -($loader.width() / 2) + "px",
              "margin-top": -($loader.height() / 2) + "px"
          });
      },
      update: function (element, valueAccessor) {
          var isLoading = ko.utils.unwrapObservable(valueAccessor()),
              $element = $(element),
              $childrenToHide = $element.children(":not(div.loader)"),
              $loader = $element.find("div.loader");

          if (isLoading) {
              $childrenToHide.css("visibility", "hidden").attr("disabled", "disabled");
              $loader.show();
          }
          else {
              $loader.fadeOut("fast");
              $childrenToHide.css("visibility", "visible").removeAttr("disabled").show();
          }
      }
  };

  var Plugin = function Plugin(rawPlugin, configManager) {
    var self = this;
    self.rawPlugin = rawPlugin;
    self.config = {};
    self.isEnabled = ko.observable(true);
    self.name = ko.computed(function () {
      return self.rawPlugin.name.replace('openrov-plugin-','');
    });
    self.url = ko.computed(function () {
      return self.rawPlugin.url;
    });
    self.homepage = ko.observable('');
    self.description = ko.observable('');
    self.raiting = ko.observable('');
    self.installed = ko.computed(function () {
      return self.rawPlugin.InstalledOnROV === true ? true : false;
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

    var giturl = self.rawPlugin.url.replace('.git','').replace('git://github.com/','https://api.github.com/repos/')
    $.getJSON( giturl, function( data ) {
      self.description(data.description);
      self.raiting(data.stargazers_count);
      self.homepage(data.homepage != null ? data.homepage : data.html_url);
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

      $('#collapsePluginFinder').on('show', function (e) {
        if (self.model.cachedAvailablePlugins.length==0){
          self.model.isLoading(true);
          self.cockpit.socket.emit('plugin-finder.search','');
        }
       });
    });

    this.model.install.subscribe(function(plugin){
      self.model.isInstalling(true);
      self.cockpit.socket.emit('plugin-finder.install',plugin.rawPlugin.name);
    });

    this.model.uninstall.subscribe(function(plugin){
      self.model.isInstalling(true);
      self.cockpit.socket.emit('plugin-finder.uninstall',plugin.rawPlugin.name);
    });

    this.model.requestedPluginDetail.subscribe(function(plugin){
      window.open("http://bower.io/search/?q="+plugin.name(),"bowerInfo");
    });

    self.cockpit.socket.on('pluginfindersearchresults', function(results){

      console.log('evaluating plugin for pluginmanager');
      results.forEach(function (plugin) {
        var plg = new Plugin(plugin, configManager);
        self.model.availablePlugins.push(plg);
        self.model.cachedAvailablePlugins.push(plg);
      });
      self.model.isLoading(false);
    });

    self.cockpit.socket.on('pluginfinderinstallresults', function(result){
      console.log(result);
      self.model.isInstalling(false);
    });

    self.cockpit.socket.on('pluginfinderuninstallresults', function(result){
      console.log(result);
      self.model.isInstalling(false);
    });

    self.cockpit.socket.on('pluginfinderinstallstatus', function(status){
      console.log(status);
    });

    self.cockpit.socket.on('pluginfinderrestartRequired', function(){
      alert('Plugin Installed, you will need to refresh the browser to load the plugin. ');
    });


  };
  window.Cockpit.plugins.push(PluginFinder);
}(window, jQuery));
