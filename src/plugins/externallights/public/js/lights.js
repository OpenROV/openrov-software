(function(window) {
  'use strict';
  var plugins = namespace('plugins');
  plugins.ExternalLights = function(cockpit) {
    var self = this;
    self.cockpit = cockpit;

  };

  //This pattern will hook events in the cockpit and pull them all back
  //so that the reference to this instance is available for further processing
  plugins.ExternalLights.prototype.listen = function listen() {
    var self = this;

    self.cockpit.extensionPoints.inputController.register(
      [
        // lights increment
        {
          name: 'plugin.externalLights.adjust_increment',
          description: 'Makes the ROV lights brighter.',
          defaults: { keyboard: 'u'},
          down: function () {
            cockpit.rov.emit('plugin.externalLights.adjust', 0.1);
          }
        },

        // lights decrement
        {
          name: 'plugin.externalLights.adjust_increment',
          description: 'Makes the ROV lights dimmer.',
          defaults: { keyboard: 'y'},

          down: function () {
            cockpit.rov.emit('plugin.externalLights.adjust', -0.1);
          }
        },

        // lights toggle
        {
          name: 'plugin.externalLights.toggle',
          description: 'Toggles the ROV lights on/off.',
          defaults: { keyboard: 't' },
          down: function () {
            cockpit.rov.emit('plugin.externalLights.toggle');
          }
        }

      ]);


      //Listen for the existing events from the standard light
      //component and route it to our webcomponent for display
      self.cockpit.rov.on('plugin.lights.level', function(level) {
        self.internal_brightnessLevel = level;
      });

      self.cockpit.rov.on('plugin.externalLights.level', function(level) {
        self.external_brightnessLevel = level;
      });

  };

  window.Cockpit.plugins.push(plugins.ExternalLights);

})(window);
