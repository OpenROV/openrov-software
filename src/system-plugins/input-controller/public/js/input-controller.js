 (function (window, document) {
   var inputController = namespace('systemPlugin.inputController');

   inputController.InputController = function (cockpit) {
    var self = this;
    self.cockpit = cockpit;

    var registerdCommands = {};
    var controllers = [];
    // add our known controllers
    controllers.push(new inputController.Keyboard(cockpit));
    controllers.push(new inputController.Gamepad(cockpit));

    var registerControls = function(control) {
      if (control === undefined) return;
      var controlsToRegister = [].concat(control); // control can be a single object or an array
      controlsToRegister.forEach(function(aControl){
        if (aControl === undefined) return;
        var command = new inputController.Command(aControl);

        registerdCommands[command.name] = command;
        console.log('InputController: Registering control ' + command.name );
        controllers.forEach(function(controller) {
          controller.register(command);
        });
      });
    };

    var unregisterControls = function(controlName) {
      // maybe it would be nicer to actually unregister the controls
      // rather than resetting and reapplying
      var controlsToRemove = [].concat(controlName); // controlName could be a single object or an array

      controlsToRemove.forEach(function(control){
        delete registerdCommands[control];
      });
      controllers.forEach(function(controller) { controller.reset(); });

      var commandsToRegister = [];
      for(var command in registerdCommands) {
        commandsToRegister.push(registerdCommands[command]);
      }

      registerControls(commandsToRegister);
    };

    self.cockpit.on('inputController.register', registerControls);
    self.cockpit.on('inputController.unregister', unregisterControls);

    return self;
  };
  window.Cockpit.plugins.push(inputController.InputController);
}(window, document));