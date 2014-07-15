var inputController = namespace('systemPlugin.inputController');
inputController.Command = function(control) {
  if (control instanceof inputController.Command) { return control; }

  var self = this;
  if (control.name === undefined ||
      control.name.constructor != String ||
      control.name.trim().length === 0) {
    alert("The passed InputController command does not have a valid string as property 'name'!\n" +
          "Object: " + JSON.stringify(control));
  }
  else {
    self.name = control.name;
  }

  self.description = control.description || self.name;
  if (control.down !== undefined) self.down = control.down;
  if (control.up !== undefined) self.up = control.up;
  if (control.axis !== undefined) self.axis = control.axis;

  if (control.secondary !== undefined) {
    var secondaries = [];
    control.secondary.forEach(function(secondary) {
      secondaries.push(new inputController.Command(secondary));
    });
    self.secondary = secondaries;
  }

  self.defaults = control.defaults;
  self.bindings = control.defaults; // entry point to load binding values from configuration

  self.active = control.active !== undefined ? control.active : true;
  return this;
};

inputController.Command.prototype.down = function() {};
inputController.Command.prototype.up = function() {};
inputController.Command.prototype.axis = function(v) {};