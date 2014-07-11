/*jshint esnext:true */
(function (window, document) {
  // These constants map to the arduino device.h file's constants for capabilities of the ROV
  const LIGHTS_CAPABLE = 1;
  const CALIBRATION_LASERS_CAPABLE = 2;
  const CAMERA_MOUNT_1_AXIS_CAPABLE = 3;
  const COMPASS_CAPABLE = 4;
  const ORIENTATION_CAPABLE = 5;
  const DEAPTH_CAPABLE = 6;
  var hostname = document.location.hostname ? document.location.hostname : 'localhost';

  //Cockpit is inheriting from EventEmitter2.
  var Cockpit = function Cockpit(csocket) {
    this.socket = csocket;
    this.sendUpdateEnabled = true;
    this.capabilities = 0;
    this.loadedPlugins = [];
    this.loadPlugins();
    console.log('loaded plugins');
    // Register the various event handlers
    this.listen();
  };
  Cockpit.prototype = new EventEmitter2();
  Cockpit.prototype.constructor = Cockpit;

  Cockpit.prototype.listen = function listen() {
    var cockpit = this;
    cockpit.socket.on('rovsys', function (data) {
      console.log('got RovSys update from Arduino');
      if ('capabilities' in data) {
        cockpit.capabilities = data.capabilities;
      }
    });
  };

  Cockpit.prototype.loadPlugins = function loadPlugins() {
    var cockpit = this;
    Cockpit.plugins.forEach(function (plugin) {
      var loadedPlugin = null;
      try {
        loadedPlugin = new plugin(cockpit);
      } catch (err) {
        console.log('error loading a plugin!!!' + err);
      }
      if (loadedPlugin != null && loadedPlugin !== undefined) {
        if (loadedPlugin.canBeDisabled != undefined) {
          if (loadedPlugin.name == undefined) {
            alert('Plugin ' + loadedPlugin + 'has to define a name property!');
          }
        }
        cockpit.loadedPlugins.push(loadedPlugin);
      }
    });
    cockpit.loadedPlugins.forEach(function(plugin){
      if (plugin.listen !== undefined){
        plugin.listen();
      }
    });

    Cockpit.plugins = [];  //flush them out for now. May move to a loaded array if we use in the future
    cockpit.emit('cockpit.pluginsLoaded');
  };
  Cockpit.prototype.addPlugin = function addPlugin(plugin) {
    var cockpit = this;
    Cockpit.plugins.push(plugin);
    new plugin(cockpit);
  };
  // Static array containing all plugins to load
  Cockpit.plugins = [];
  window.Cockpit = Cockpit;
}(window, document));
