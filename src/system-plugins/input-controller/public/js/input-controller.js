(function (window, document) {
  var inputController = namespace('systemPlugin.inputController');
  inputController.InputController = function (cockpit) {
    var self = this;
    self.cockpit = cockpit;
    self.model = { commands: ko.observableArray() };
    self.registerdCommands = {};
    self.registerdControls = {};
    self.controllers = [];
    // add our known controllers
    self.controllers.push(new inputController.Keyboard(cockpit));
    self.controllers.push(new inputController.Gamepad(cockpit));

    self.checkDuplicates = function () {
      var commandBindings = [];
      var duplicateInformation = [];
      for (var command in self.registerdCommands) {
        if (self.registerdCommands[command].active) {
          for (var binding in self.registerdCommands[command].bindings) {
            commandBindings.push({
              value: binding + ':' + self.registerdCommands[command].bindings[binding],
              name: self.registerdCommands[command].name
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

    this.cockpit.extensionPoints.rovSettings.append('<div id="inputcontroller-settings"></div>');

    var jsFileLocation = urlOfJsFile('input-controller.js');
    var controllerSettings = this.cockpit.extensionPoints.rovSettings.find('#inputcontroller-settings');
    controllerSettings.load(jsFileLocation + '../settings.html', function () {
      ko.applyBindings(self.model, controllerSettings[0]);
    });

    this.cockpit.extensionPoints.inputController = self;
    return self;
  };

  inputController.InputController.prototype.register = function (control) {
    var self = this;
    if (control === undefined)
      return;
    var controlsToRegister = [].concat(control);
    // control can be a single object or an array
    controlsToRegister.forEach(function (aControl) {
      if (aControl === undefined)
        return;
      var command = new inputController.Command(aControl);
      self.registerdCommands[command.name] = command;


      self.model.commands.push(command);
      console.log('InputController: Registering control ' + command.name);
      self.controllers.forEach(function (controller) {
        if (command.active) {
          controller.register(command);
          for(var property in command.bindings) {
            self.registerdControls[property+":"+command.bindings[property]] = command;
          }
        }
      });
    });
    self.controlsToRegister = [];
    self.checkDuplicates();
  };

  inputController.InputController.prototype.unregister = function (controlName) {
    var self = this;
    var controlsToRemove = [].concat(controlName);
    // controlName could be a single object or an array
    controlsToRemove.forEach(function (control) {
      delete self.registerdCommands[control];
      for(var property in control.bindings) {
        //it is possible that a different control actually owns a particular binding
        if (self.registerdControls[property+":"+control.bindings[property]] === control){
          delete self.registerdControls[property+":"+control.bindings[property]];
        }
      }
    });
    self.controllers.forEach(function (controller) {
      controller.reset();
    });
    var commandsToRegister = [];
    for (var command in self.registerdCommands) {
      commandsToRegister.push(self.registerdCommands[command]);
    }
    self.model.commands.length = 0;
    self.register(commandsToRegister);
  };

  inputController.InputController.prototype.activate = function(controlName) {
    var self = this;
    var controlsToActivate = [].concat(controlName);
    controlsToActivate.forEach(function(commandName) {
      var command = self.registerdCommands[commandName];
      command.replaced = [];
      for(var property in command.bindings) {
        if (self.registerdControls[property+":"+command.bindings[property]] !== undefined){
          console.log("There is a conflict with " + self.registerdControls[property+":"+command.bindings[property]].name);
          command.replaced.push(self.registerdControls[property+":"+command.bindings[property]]);
        }
      }

      command.active = true;
      self.register(command);

      console.log("activated command " + command.name);
    });
  };

  inputController.InputController.prototype.deactivate = function(controlName) {
    var self = this;
    var controlsToDeactivate = [].concat(controlName);
    controlsToDeactivate.forEach(function(commandName) {
      var command = self.registerdCommands[commandName];
      command.active = false;
      self.unregister(command);
      command.replaced.forEach(function(oldcommand){
        self.register(oldcommand);
        console.log("re-activated " + oldcommand.name);
      });
      command.replaced = null;
      console.log("Deactivated command " + command.name);
    });

  };

  window.Cockpit.plugins.push(inputController.InputController);
}(window, document));
