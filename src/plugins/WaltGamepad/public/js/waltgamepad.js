(function (window, $, undefined) {
  'use strict';
  var WaltGamePad;
  WaltGamePad = function Example(cockpit) {
    console.log('Loading WaltGamePad plugin in the browser.');
    // Instance variables
    this.cockpit = cockpit;
    this.waltGamePadControlActive = false;
    this.originalsettings = {};
    this.leftx = 0;
    this.lefty = 0;
    this.rightx = 0;
    this.righty = 0;
    this.lift = 0;
    // Add required UI elements
    $('#keyboardInstructions').append('<p><i>w</i> to toggle Walt Gamepad control</p>');
    this.listen();
  };
  WaltGamePad.prototype.listen = function listen() {
    var rov = this;
    KEYS[87] = {
      keydown: function () {
        rov.toggleControl();
      }
    };  // w
  };
  WaltGamePad.prototype.toggleControl = function toggleControl() {
    var rov = this;
    if (!this.waltGamePadControlActive) {
      rov.originalsettings.lsx = GAMEPAD.LEFT_STICK_X;
      rov.originalsettings.lsy = GAMEPAD.LEFT_STICK_Y;
      rov.originalsettings.rsx = GAMEPAD.RIGHT_STICK_X;
      rov.originalsettings.rsy = GAMEPAD.RIGHT_STICK_Y;

/*      GAMEPAD.LEFT_STICK_X = {
        AXIS_CHANGED: function (v) {
          var direction;
          rov.leftx = -v;
          if (rov.leftx + rov.rightx >= 0) {
            direction = 1;
          } else {
            direction = -1;
          }
          rov.lift = direction * Math.max(Math.abs(rov.leftx), Math.abs(rov.rightx));
          cockpitEventEmitter.emit('rovpilot.manualMotorThrottle', rov.lefty, rov.lift, rov.righty);
        }
      };
*/
      GAMEPAD.X = {
          BUTTON_DOWN: function () {
              cockpitEventEmitter.emit('rovpilot.toggleholdDepth');
          }
      };

      rov.waltGamePadControlActive = true;
      console.log('Walt GamePad Control Active');
    } else {
      GAMEPAD.LEFT_STICK_X = rov.originalsettings.lsx;
      GAMEPAD.LEFT_STICK_Y = rov.originalsettings.lsy;
      GAMEPAD.RIGHT_STICK_X = rov.originalsettings.rsx;
      GAMEPAD.RIGHT_STICK_Y = rov.originalsettings.rsy;
      rov.waltGamePadControlActive = false;
      console.log('Walt GamePad Control Deactivated');
    }
  };
  window.Cockpit.plugins.push(WaltGamePad);
}(window, jQuery));