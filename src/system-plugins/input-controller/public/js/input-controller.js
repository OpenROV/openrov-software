(function (window, document) {
  var inputController = namespace('systemPlugin.inputController');
  inputController.InputController = function (cockpit) {
    var self = this;
    self.cockpit = cockpit;
    self.model = { commands: ko.observableArray() };
    var registerdCommands = {};
    var registerdControls = {};
    var controllers = [];
    // add our known controllers
    controllers.push(new inputController.Keyboard(cockpit));
    controllers.push(new inputController.Gamepad(cockpit));
    var checkDuplicates = function () {
      var commandBindings = [];
      var duplicateInformation = [];
      for (var command in registerdCommands) {
        if (registerdCommands[command].active) {
          for (var binding in registerdCommands[command].bindings) {
            commandBindings.push({
              value: binding + ':' + registerdCommands[command].bindings[binding],
              name: registerdCommands[command].name
            });
          }
        }
      }
      commandBindings.forEach(function (binding) {
        commandBindings.forEach(function (checkBinding) {
          if (binding === checkBinding)
            return;
          if (binding.value === checkBinding.value) {
            duplicateInformation.push('Command name: \'' + binding.name + '\' Binding: ' + binding.value);
          }
        });
      });
      if (duplicateInformation.length > 0) {
        alert('Found duplicate commands: \n' + duplicateInformation.join('\n'));
      }
    };
    var registerControls = function (control) {
      if (control === undefined)
        return;
      var controlsToRegister = [].concat(control);
      // control can be a single object or an array
      controlsToRegister.forEach(function (aControl) {
        if (aControl === undefined)
          return;
        var command = new inputController.Command(aControl);
        registerdCommands[command.name] = command;


        self.model.commands.push(command);
        console.log('InputController: Registering control ' + command.name);
        controllers.forEach(function (controller) {
          if (command.active) {
            controller.register(command);
            for(var property in command.bindings) {
              registerdControls[property+":"+command.bindings[property]] = command;
            }
          }
        });
      });
      controlsToRegister = [];
      checkDuplicates();
    };
    var unregisterControls = function (controlName) {
      var controlsToRemove = [].concat(controlName);
      // controlName could be a single object or an array
      controlsToRemove.forEach(function (control) {
        delete registerdCommands[control];
        for(var property in control.bindings) {
          //it is possible that a different control actually owns a particular binding
          if (registerdControls[property+":"+control.bindings[property]] === control){
            delete registerdControls[property+":"+control.bindings[property]];
          }
        }
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
    var activateControls = function(controlName) {
      var controlsToActivate = [].concat(controlName);
      controlsToActivate.forEach(function(commandName) {
        var command = registerdCommands[commandName];
        command.replaced = [];
        for(var property in command.bindings) {
          if (registerdControls[property+":"+command.bindings[property]] !== undefined){
            console.log("There is a conflict with " + registerdControls[property+":"+command.bindings[property]].name);
            command.replaced.push(registerdControls[property+":"+command.bindings[property]]);
          }
        }

        command.active = true;
        registerControls(command);


        console.log("activated command " + command.name);
      });
    };
    var deactivateControls = function(controlName) {
      var controlsToDeactivate = [].concat(controlName);
      controlsToDeactivate.forEach(function(commandName) {
        var command = registerdCommands[commandName];
        command.active = false;
        unregisterControls(command);
        command.replaced.forEach(function(oldcommand){
          registerControls(oldcommand);
          console.log("re-activated " + oldcommand.name);
        });
        command.replaced = null;
        console.log("Deactivated command " + command.name);
      });

    };

    self.cockpit.on('inputController.register', registerControls);
    self.cockpit.on('inputController.unregister', unregisterControls);
    self.cockpit.on('inputController.activate', activateControls);
    self.cockpit.on('inputController.deactivate', deactivateControls);

    $('#plugin-settings').append('<div id="inputcontroller-settings"></div>');
    var jsFileLocation = urlOfJsFile('input-controller.js');
    $('#inputcontroller-settings').load(jsFileLocation + '../settings.html', function () {
      ko.applyBindings(self.model, document.getElementById('inputcontroller-settings'));
    });
    return self;
  };
  window.Cockpit.plugins.push(inputController.InputController);
}(window, document));
