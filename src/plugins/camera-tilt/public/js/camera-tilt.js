(function(window) {
  'use strict';
  var plugins = namespace('plugins');
  plugins.CameraTilt = function(cockpit) {
    var self = this;
    self.cockpit = cockpit;

    self.cockpit.extensionPoints.inputController.register(
      [
        // camera up/centre/down
        {
          name: 'plugin.cameraTilt.adjust_down',
          description: 'Point the camera further down.',
          defaults: { keyboard: 'z', gamepad: 'A' },
          down: function () {
            cockpit.rov.emit('plugin.cameraTilt.adjust', -0.1);
          }
        },
        {
          name: 'plugin.cameraTilt.adjust_centre',
          description: 'Point the camera straight ahead.',
          defaults: { keyboard: 'a', gamepad: 'B' },
          down: function () {
            cockpit.rov.emit('plugin.cameraTilt.set', 0);
          }
        },
        {
          name: 'plugin.cameraTilt.adjust_up',
          description: 'Point the camera further up.',
          defaults: { keyboard: 'q', gamepad: 'Y' },
          down: function () {
            cockpit.rov.emit('plugin.cameraTilt.adjust', 0.1);
          }
        }
      ]);
  };

  //This pattern will hook events in the cockpit and pull them all back
  //so that the reference to this instance is available for further processing
  plugins.CameraTilt.prototype.listen = function listen() {
  };

  window.Cockpit.plugins.push(plugins.CameraTilt);

})(window);