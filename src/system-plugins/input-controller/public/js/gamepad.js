var inputController = namespace('systemPlugin.inputController');
inputController.Gamepad = function(cockpit) {
  var self = this;
  self.gp = new inputController.GamepadAbstraction(cockpit);

  self.register = function(control) {
    if (control.bindings.gamepad !== undefined) {
      var gpKey = control.bindings.gamepad;
      if (gpKey !== undefined) {
        self.gp.assignment[gpKey] = { };
        if (control.down !== undefined) self.gp.assignment[gpKey].BUTTON_DOWN = control.down;
        if (control.up !== undefined) self.gp.assignment[gpKey].BUTTON_UP = control.up;
        if (control.axis !== undefined) self.gp.assignment[gpKey].AXIS_CHANGED = control.axis;

        if (control.secondary !== undefined) {
          control.secondary.forEach(function (secondary) {
            if (secondary.bindings.gamepad !== undefined) {
              var subKey = gpKey + '+' + secondary.bindings.gamepad;
              self.gp.assignment[subKey] = { };
              if (secondary.down !== undefined) self.gp.assignment[subKey].BUTTON_DOWN = secondary.down;
              if (secondary.up !== undefined) self.gp.assignment[subKey].BUTTON_UP = secondary.up;
              if (secondary.axis !== undefined) self.gp.assignment[subKey].AXIS_CHANGED = secondary.axis;
            }
          });
        }
      }
    }
  };

  self.unregister = function(control) {
    var gpKey = control.bindings.gamepad;
    if (gpKey !== undefined) {
      self.gp.assignment[gpKey] = undefined;

      if (control.secondary !== undefined) {
        control.secondary.forEach(function (secondary) {
          if (secondary.bindings.gamepad !== undefined) {
            var subKey = gpKey + '+' + secondary.bindings.gamepad;
            self.gp.assignment[subKey] = undefined;
          }
        });
      }
    }
  };

  self.reset = function () {
    for (var control in self.gp.assignment) {
      self.gp.assignment[control] = undefined;
    }
  };

  return self;
};
