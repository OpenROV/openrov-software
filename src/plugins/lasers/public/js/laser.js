(function(window) {
  'use strict';
  var plugins = namespace('plugins');
  plugins.Laser = function(cockpit) {
    var self = this;
    self.cockpit = cockpit;

    self.cockpit.extensionPoints.inputController.register(
      [
        {
          name: "plugin.laser.Toggle",
          description: "Toggles the lasers on or off.",
          defaults: { keyboard: 'l' },
          down: function () {
            cockpit.rov.emit('plugin.laser.toggle');
          }
        }
      ]);
  };

  //This pattern will hook events in the cockpit and pull them all back
  //so that the reference to this instance is available for further processing
  plugins.Laser.prototype.listen = function listen() {
  };

  window.Cockpit.plugins.push(plugins.Laser);

})(window);