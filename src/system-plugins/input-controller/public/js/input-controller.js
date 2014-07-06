 (function (window, document) {
  var InputController = function InputController(cockpit) {
    var self = this;
    self.cockpit = cockpit
    self.gp = new GamePad(cockpit);

    self.cockpit.on('inputController.register', self.registerControl)

    return self;
  };
  InputController.prototype.registerControl = function(control)
  {
    if (control.down !== undefined) {
      // register keydown on keyboard
      if (control.defaults.keyboard !== undefined) {
        if (control.up === undefined) { //register key press
          Mousetrap.bind(control.defaults.keyboard, control.down);
        }
        else {
          Mousetrap.bind(control.defaults.keyboard, control.down, 'keydown');
          Mousetrap.bind(control.defaults.keyboard, control.up, 'keyup');
        }
      }
      // register button down on gamepad
      if (control.defaults.gamepad !== undefined) {
        GAMEPAD[control.defaults.gamepad] = {
          BUTTON_DOWN: control.down,
          BUTTON_UP: control.up
        }
      }
    }
  };
  window.Cockpit.plugins.push(InputController);
}(window, document));