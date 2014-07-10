 (function (window, document) {
  var InputController = function InputController(cockpit) {
    var self = this;
    self.cockpit = cockpit
    self.gp = new GamePad(cockpit);
    self.keyboardBindings = {};

    function registerKeyboard(control) {
      var key = control.defaults.keyboard;
      if (control.down != undefined) Mousetrap.bind(key, control.down, 'keydown');
      if (control.up !== undefined) Mousetrap.bind(key, control.up, 'keyup');
      if (control.secondary !== undefined) {
        control.secondary.forEach(function (secondary) {
          if (secondary.down !== undefined) Mousetrap.bind(key + '+' + secondary.defaults.keyboard, secondary.down, 'keydown');
          if (secondary.up !== undefined)  Mousetrap.bind(key + '+' + secondary.defaults.keyboard, secondary.up, 'keyup');
        });
      }
    }

    function registerGamepad(control) {
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

    self.registerControl = function(control) {
      if (control.defaults.keyboard !== undefined) {
        registerKeyboard(control);
      }
      if (control.defaults.gamepad !== undefined) {
        registerGamepad(control);
      }
    };

    self.cockpit.on('inputController.register', self.registerControl);

    return self;
  };
  window.Cockpit.plugins.push(InputController);
}(window, document));