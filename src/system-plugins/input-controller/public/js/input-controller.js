 (function (window, document) {
  var InputController = function InputController(cockpit) {
    var self = this;
    self.cockpit = cockpit
    self.gp = new GamePad(cockpit);
    self.keyboardBindings = {};

    self.registerControl = function(control)
    {
      if (control.down !== undefined) {
        // register keydown on keyboard
        if (control.defaults.keyboard !== undefined) {
          var key = control.defaults.keyboard;
          Mousetrap.bind(key, control.down, 'keydown');
          Mousetrap.bind(key, control.up, 'keyup');
          if (control.secondary !== undefined) {
            control.secondary.forEach(function(secondary) {
              Mousetrap.bind(key + '+' + secondary.defaults.keyboard, secondary.down, 'keydown');
              if (secondary.up !== undefined) {
                Mousetrap.bind(key + '+' + secondary.defaults.keyboard, secondary.up, 'keyup');
              }
            });
          }
        }
        // register button down on gamepad
        if (control.defaults.gamepad !== undefined) {
          var gpKey = control.defaults.gamepad;
          GAMEPAD[gpKey ] = {
            BUTTON_DOWN: control.down,
            BUTTON_UP: control.up
          };
          if (control.secondary !== undefined) {
            control.secondary.forEach(function(secondary) {
              var subKey = gpKey  + '+' + secondary.defaults.gamepad;
              GAMEPAD[subKey] = {
                BUTTON_DOWN: secondary.down,
                BUTTON_UP: secondary.up
              };
            });
          }
        }
      }
    };

    self.cockpit.on('inputController.register', self.registerControl);

    return self;
  };
  window.Cockpit.plugins.push(InputController);
}(window, document));