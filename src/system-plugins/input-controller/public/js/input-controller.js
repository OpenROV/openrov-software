 (function (window, document) {
  var InputController = function InputController(cockpit) {
    var self = this;
    self.cockpit = cockpit

    var registeredControls = {};
    var controllers = [];
    // add our known controllers
    controllers.push(new KeyboardInputController(cockpit));
    controllers.push(new GamepadInputController(cockpit));

    var registerControl = function(control) {
      registeredControls[control.name] = control;
      console.log('InputController: Registering control ' + control.name );
      controllers.forEach(function(controller) {
        controller.register(control);
      });
    };

    var unregisterControl = function(controlName) {
      // maybe it would be nicer to actually unregister the controls
      // rather than resetting and reapplying
      if (registeredControls[controlName] !== undefined){
        delete registeredControls[controlName]
        controllers.forEach(function(controller) { controller.reset(); });
      }

      for(var control in registeredControls) {
        if (registeredControls[control] !== undefined) {
          registerControl(registeredControls[control]);
        }
      }
    };

    self.cockpit.on('inputController.register', registerControl);
    self.cockpit.on('inputController.unregister', unregisterControl);

    return self;
  };
  window.Cockpit.plugins.push(InputController);
}(window, document));