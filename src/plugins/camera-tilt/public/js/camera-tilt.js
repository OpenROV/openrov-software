(function(window) {
  'use strict';
  var plugins = namespace('plugins');
  plugins.CameraTilt = function(cockpit) {
    var self = this;
    self.cockpit = cockpit;

    cockpit.emit('inputController.register',
      [
        // camera up/centre/down
        {
          name: "plugin.cameraTilt.adjust_down",
          description: "Point the camera further down.",
          defaults: { keyboard: 'z', gamepad: 'Y' },
          down: function () {
            cockpit.emit('plugin.cameraTilt.adjust', 0.1);
          }
        },
        {
          name: "plugin.cameraTilt.adjust_centre",
          description: "Point the camera straight ahead.",
          defaults: { keyboard: 'a', gamepad: 'B' },
          down: function () {
            cockpit.emit('plugin.cameraTilt.set', 0);
          }
        },
        {
          name: "plugin.cameraTilt.adjust_up",
          description: "Point the camera further up.",
          defaults: { keyboard: 'q', gamepad: 'A' },
          down: function () {
            cockpit.emit('plugin.cameraTilt.adjust', -0.1);
          }
        }
      ]);
  };

  //This pattern will hook events in the cockpit and pull them all back
  //so that the reference to this instance is available for further processing
  plugins.CameraTilt.prototype.listen = function listen() {
    var self = this;

    // register the messages that should be transfered from and to the socket
    self.cockpit.messaging.register({
      toSocket: [
        { name: 'plugin.cameraTilt.set', signature: ['value'] },
        { name: 'plugin.cameraTilt.adjust', signature: ['value'] }
      ],
      fromSocket: [
        { name: 'plugin.cameraTilt.angle', signature: ['angle']}
      ]
    });

  };

  window.Cockpit.plugins.push(plugins.CameraTilt);

})(window);