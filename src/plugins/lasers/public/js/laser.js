(function(window) {
  'use strict';
  var plugins = namespace('plugins');
  plugins.Laser = function(cockpit) {
    var self = this;
    self.cockpit = cockpit;

    cockpit.emit('inputController.register',
      [
        {
          name: "plugin.laser.Toggle",
          description: "Toggles the lasers on or off.",
          defaults: { keyboard: 'l' },
          down: function () {
            cockpit.emit('plugin.laser.laser.toggle');
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
      toSocket: ['plugin.laser.laser.toggle'],
      fromSocket: [
        'plugin.laser.laser.enabled',
        'plugin.laser.laser.disabled'
      ]
    });

    self.cockpit.emit('headsUpMenu.register', [
      {
        label: "Toggle Lasers",
        callback: function () {
          self.cockpit.emit('plugin.laser.laser.toggle');
        }
      }
    ]);


  };

  window.Cockpit.plugins.push(plugins.Laser);

})(window);