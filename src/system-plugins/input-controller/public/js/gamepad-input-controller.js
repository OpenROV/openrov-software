var GamepadInputController = function GamepadInputController(cockpit) {
  var self = this;
  self.gp = new GamePad(cockpit);

  self.register = function(control) {
    if (control.defaults.gamepad !== undefined) {
      var gpKey = control.defaults.gamepad;
      GAMEPAD[gpKey] = { };
      if (control.down !== undefined) GAMEPAD[gpKey].BUTTON_DOWN = control.down;
      if (control.up !== undefined) GAMEPAD[gpKey].BUTTON_UP = control.up;
      if (control.axis !== undefined) GAMEPAD[gpKey].AXIS_CHANGED = control.axis;

      if (control.secondary !== undefined) {
        control.secondary.forEach(function (secondary) {
          var subKey = gpKey + '+' + secondary.defaults.gamepad;
          GAMEPAD[subKey] = { };
          if (secondary.down != undefined) GAMEPAD[subKey].BUTTON_DOWN = secondary.down;
          if (secondary.up != undefined) GAMEPAD[subKey].BUTTON_UP = secondary.up;
          if (secondary.axis != undefined) GAMEPAD[subKey].AXIS_CHANGED = secondary.axis;
        });
      }
    }
  };

  self.reset = function () {
    for (var control in GAMEPAD) {
      GAMEPAD[control] = undefined;
    }
  };

  return self;
};