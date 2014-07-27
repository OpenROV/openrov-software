(function (window, $, undefined) {
  'use strict';
  var ElevonControl;
  ElevonControl = function Example(cockpit) {
    console.log('Loading ElevonControl plugin in the browser.');
    // Instance variables
    this.cockpit = cockpit;
    this.elevonControlActive = false;
    this.originalsettings = {};
    this.leftx = 0;
    this.lefty = 0;
    this.rightx = 0;
    this.righty = 0;
    this.lift = 0;

    //inputControl names
    this.controlNames = {
      pitch: "elevonControl.pitch",
      roll: "elevonControl.roll",
    };

    // for plugin management:
    this.name = 'elevonControl';   // for the settings
    this.viewName = 'Elevon Control plugin (BETA)'; // for the UI
    this.canBeDisabled = true; //allow enable/disable
    this.defaultEnabled = false;
    var self=this;
    this.enable = function () {
      self.toggleControl();
    };
    this.disable = function () {
      self.toggleControl();
    };

  };
  ElevonControl.prototype.listen = function listen() {
    var rov = this;
  };

  ElevonControl.prototype.toggleControl = function toggleControl() {
    var rov = this;
    if (!this.elevonControlActive) {
      rov.cockpit.emit('inputController.register',
        [
          {
            name: rov.controlNames.pitch,
            description: "Elevoncontrol: Pitch control for the right hand gamepad.",
            defaults: { gamepad: 'RIGHT_STICK_Y' },
            axis: function (v) {
              rov.cockpit.emit('rovpilot.setPitchControl', v);
            }
          },
          {
            name: rov.controlNames.roll,
            description: "Elevoncontrol: Roll control for the right hand gamepad.",
            defaults: { gamepad: 'RIGHT_STICK_X' },
            axis: function (v) {
              rov.cockpit.emit('rovpilot.setRollControl', v);
            }
          }
        ]);

      rov.elevonControlActive = true;
      console.log('Elevon Control Active');
    }
    else {
      var controlsToRemove = [];
      for (var name in rov.controlNames) {
        controlsToRemove.push('elevonControl.' + name);
      }
      rov.cockpit.emit('inputController.unregister', controlsToRemove);
      rov.elevonControlActive = false;
      console.log('Elevon Control Deactivated');
    }
  };
  window.Cockpit.plugins.push(ElevonControl);
}(window, jQuery));
