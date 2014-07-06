 (function (window, document) {
  var InputController = function InputController(cockpit) {
    var self = this;
    self.cockpit = cockpit;

    self.cockpit.on('inputController.register', self.registerControl)

    return self;
  };
  InputController.prototype.registerControl = function(control)
  {
    alert(control.defaults.keyboard);
    if (control.down !== undefined && control.up == undefined) {
      Mousetrap.bind(control.defaults.keyboard, control.down)
    }
  };
  window.Cockpit.plugins.push(InputController);
}(window, document));