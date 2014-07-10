 (function (window, document) {
  var InputController = function InputController(cockpit) {
    var self = this;
    self.cockpit = cockpit

    var registeredControls = {};
    var controllers = [];
    // add our known controllers
    controllers.push(new KeyboardInputController(cockpit));
    controllers.push(new GamepadInputController(cockpit));

    var registerControls = function(control) {
      if (control == undefined) return;
      var controlsToRegister = [].concat(control); // control can be a single object or an array
      controlsToRegister.forEach(function(aControl){
        if (aControl == undefined) return;
        registeredControls[aControl.name] = aControl;
        console.log('InputController: Registering control ' + aControl.name );
        controllers.forEach(function(controller) {
          controller.register(aControl);
        });
      });
    };

    var unregisterControls = function(controlName) {
      // maybe it would be nicer to actually unregister the controls
      // rather than resetting and reapplying
      var controlsToRemove = [].concat(controlName); // if controlName could be a single object or an array

      controlsToRemove.forEach(function(control){
        delete registeredControls[control];
      });
      controllers.forEach(function(controller) { controller.reset(); });

      var controlsToRegister = [];
      for(var control in registeredControls) {
        controlsToRegister.push(registeredControls[control]);
      }

      registerControls(controlsToRegister);
    };

    self.cockpit.on('inputController.register', registerControls);
    self.cockpit.on('inputController.unregister', unregisterControls);

    return self;
  };
  window.Cockpit.plugins.push(InputController);
}(window, document));