 (function (window, document) {
  var InputController = function InputController(cockpit) {
    var self = this;
    self.cockpit = cockpit

    var controllers = [];
    controllers.push(new KeyboardInputController(cockpit));
    controllers.push(new GamepadInputController(cockpit));

    self.registerControl = function(control) {
      controllers.forEach(function(controller) {
        controller.register(control);
      });
    };

    self.cockpit.on('inputController.register', self.registerControl);

    return self;
  };
  window.Cockpit.plugins.push(InputController);
}(window, document));