(function (window, $, undefined) {
  'use strict';
  var TankControl;
  TankControl = function Example(cockpit) {
    console.log('Loading TankControl plugin in the browser.');
    // Instance variables
    this.cockpit = cockpit;
    this.tankControlActive = false;
    this.originalsettings = {};
    this.leftx = 0;
    this.lefty = 0;
    this.rightx = 0;
    this.righty = 0;
    this.lift = 0;

    //inputControl names
    this.controlNames = {
      leftLift: "tankControl.leftLift",
      portThrottle: "tankControl.portThrottle",
      rightLift: "tankControl.rightLift",
      starboardThrottle: "tankControl.starboardThrottle"
    };

    // Add required UI elements
    $('#keyboardInstructions').append('<p><i>t</i> to toggle tank control</p>');
    this.listen();
  };
  TankControl.prototype.listen = function listen() {
    var rov = this;

    // Toggle tank control
    rov.cockpit.emit('inputController.register',
      {
        name: "tankcontrol.toggleTankControl",
        description: "Toggles the tank control mode on/off",
        defaults: { keyboard: 't' },
        down: function() { rov.toggleControl(); }
      });
  };
  TankControl.prototype.toggleControl = function toggleControl() {
    var rov = this;
    if (!this.tankControlActive) {
      rov.cockpit.emit('inputController.register',
        {
          name: rov.controlNames.leftLift,
          description: "Tankcontrol: Lift control control for the left hand gamepad.",
          defaults: { gamepad: 'LEFT_STICK_X' },
          axis: function (v) {
            var direction;
            rov.leftx = -v;
            if (rov.leftx + rov.rightx >= 0) {
              direction = 1;
            } else {
              direction = -1;
            }
            rov.lift = direction * Math.max(Math.abs(rov.leftx), Math.abs(rov.rightx));
            rov.cockpit.emit('rovpilot.manualMotorThrottle', rov.lefty, rov.lift, rov.righty);
          }
        });

      rov.cockpit.emit('inputController.register',
        {
          name: rov.controlNames.portThrottle,
          description: "Tankcontrol: Throttle control for the port prop.",
          defaults: { gamepad: 'LEFT_STICK_Y' },
          axis: function (v) {
            rov.lefty = v;
            rov.cockpit.emit('rovpilot.manualMotorThrottle', rov.lefty, rov.lift, rov.righty);
          }
        });

      rov.cockpit.emit('inputController.register',
        {
          name: rov.controlNames.rightLift,
          description: "Tankcontrol: Lift control control for the right hand gamepad.",
          defaults: { gamepad: 'RIGHT_STICK_X' },
          axis: function (v) {
            var direction;
            rov.rightx = v;
            if (rov.leftx + rov.rightx >= 0) {
              direction = 1;
            } else {
              direction = -1;
            }
            rov.lift = direction * Math.max(Math.abs(rov.leftx), Math.abs(rov.rightx));
            rov.cockpit.emit('rovpilot.manualMotorThrottle', rov.lefty, rov.lift, rov.righty);
            console.log('rov.lift:' + rov.lift);
          }
        });

      rov.cockpit.emit('inputController.register',
        {
          name: rov.controlNames.starboardThrottle,
          description: "Tankcontrol: Throttle control for the starboard prop.",
          defaults: { gamepad: 'RIGHT_STICK_Y' },
          axis: function (v) {
            rov.righty = v;
            rov.cockpit.emit('rovpilot.manualMotorThrottle', rov.lefty, rov.lift, rov.righty);
          }
        });

      rov.tankControlActive = true;
      console.log('Tank Control Active');
    }
    else {
      for (var name in rov.controlNames) {
        rov.cockpit.emit('inputController.unregister', 'tankControl.' + name);
      }
      rov.tankControlActive = false;
      console.log('Tank Control Deactivated');
    }
  };
  window.Cockpit.plugins.push(TankControl);
}(window, jQuery));