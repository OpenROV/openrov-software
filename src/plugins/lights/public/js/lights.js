(function(window) {
  'use strict';
  var plugins = namespace('plugins');
  plugins.Lights = function(cockpit) {
    var self = this;
    self.cockpit = cockpit;

    cockpit.emit('inputController.register',
      [
        // lights increment
        {
          name: "plugin.lights.adjust_increment",
          description: "Makes the ROV lights brighter.",
          defaults: { keyboard: 'p', gamepad: 'DPAD_UP' },
          down: function () {
            cockpit.emit('plugin.lights.adjust', 0.1);
          }
        },

        // lights decrement
        {
          name: "plugin.lights.adjust_increment",
          description: "Makes the ROV lights dimmer.",
          defaults: { keyboard: 'o', gamepad: 'DPAD_DOWN' },

          down: function () {
            cockpit.emit('plugin.lights.adjust', -0.1);
          }
        },

        // lights toggle
        {
          name: "plugin.lights.toggle",
          description: "Toggles the ROV lights on/off.",
          defaults: { keyboard: 'i' },
          down: function () {
            cockpit.emit('plugin.lights.toggle');
          }
        }
      ]);
  };

  //This pattern will hook events in the cockpit and pull them all back
  //so that the reference to this instance is available for further processing
  plugins.Laser.prototype.listen = function listen() {
    var self = this;

    // register the messages that should be transfered from and to the socket
    self.cockpit.messaging.register({
      toSocket: [
        'plugin.lights.toggle',
        { name: 'plugin.lights.adjust', signature: ['value'] }
      ],
      fromSocket: [
        { name: 'plugin.lights.level', signature: ['level']}
      ]
    });

  };

  window.Cockpit.plugins.push(plugins.Lights);

})(window);