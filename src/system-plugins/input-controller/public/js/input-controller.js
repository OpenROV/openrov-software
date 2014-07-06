(function (window, document) {
  var InputController = function InputController(cockpit) {
    var self = this;
    self.cockpit = cockpit;

    return self;
  };
  window.Cockpit.plugins.push(InputController);
}(window, document));