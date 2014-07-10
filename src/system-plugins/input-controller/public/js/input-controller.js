(function (window, document) {
  var inputController = namespace('systemPlugin.inputController');

  inputController.InputController = function (cockpit) {
    var self = this;
    self.cockpit = cockpit;
    self.model = { commands: ko.observableArray() };

    var registerdCommands = {};
    var controllers = [];
    // add our known controllers
    controllers.push(new inputController.Keyboard(cockpit));
    controllers.push(new inputController.Gamepad(cockpit));

    var checkDuplicates = function() {
      var commandBindings = [];
      var duplicateInformation = [];
      for(var command in registerdCommands) {
        for (var binding in registerdCommands[command].bindings) {
          commandBindings.push({ value: binding + ':' + registerdCommands[command].bindings[binding], name: registerdCommands[command].name })
        }
      }
      commandBindings.forEach(function(binding) {
        commandBindings.forEach(function(checkBinding){
          if (binding === checkBinding) return;
          if (binding.value === checkBinding.value) {
            duplicateInformation.push("Command name: '" + binding.name + "' Binding: " + binding.value);
          }
        })
      });
      if (duplicateInformation.length > 0) {
        alert("Found duplicate commands: \n"  + duplicateInformation.join('\n'));
      }
    };

    var registerControls = function (control) {
      if (control === undefined) return;
      var controlsToRegister = [].concat(control); // control can be a single object or an array
      controlsToRegister.forEach(function (aControl) {
        if (aControl === undefined) return;
        var command = new inputController.Command(aControl);

        registerdCommands[command.name] = command;
        self.model.commands.push(command);
        console.log('InputController: Registering control ' + command.name);
        controllers.forEach(function (controller) {
          controller.register(command);
        });
      });
      checkDuplicates();
    };

    var unregisterControls = function (controlName) {
      // maybe it would be nicer to actually unregister the controls
      // rather than resetting and reapplying
      var controlsToRemove = [].concat(controlName); // controlName could be a single object or an array

      controlsToRemove.forEach(function (control) {
        delete registerdCommands[control];
      });
      controllers.forEach(function (controller) {
        controller.reset();
      });

      var commandsToRegister = [];
      for (var command in registerdCommands) {
        commandsToRegister.push(registerdCommands[command]);
      }

      self.model.commands.length = 0;
      registerControls(commandsToRegister);
    };

    self.cockpit.on('inputController.register', registerControls);
    self.cockpit.on('inputController.unregister', unregisterControls);

    $('#plugin-settings').append('<div id="inputcontroller-settings"></div>');
    var jsFileLocation = urlOfJsFile('input-controller.js');
    $('#inputcontroller-settings').load(jsFileLocation + '../settings.html', function () {
      ko.applyBindings(self.model, document.getElementById('inputcontroller-settings'));
    });

    return self;
  };
  window.Cockpit.plugins.push(inputController.InputController);
}(window, document));