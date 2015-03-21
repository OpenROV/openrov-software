(function(window, document) {
  var UiLoader = function() {
    var self = this;
    self.currentUI = undefined;

    return self;
  };

  UiLoader.prototype.load = function(name, done) {
    var self = this;
    var newUi = window.Cockpit.UIs.filter(function (ui) {
      return (ui.name === name);
    });
    if (newUi && newUi.length > 0) {
      if (this.currentUI && this.currentUI.disable) {
        this.currentUI.disable();
      }

      Polymer.import([newUi[0].polymerTemplateFile], function() {
        $('#UI').append(newUi[0].template);
        self.currentUI = newUi[0];
        $(function() {
          if (self.currentUI.loaded) {
            self.currentUI.loaded();
          }
          done();
        });
      });

    }
    else {
      alert('New UI "' + name + '" could not be found!');
      done();
    }

  };

  window.UiLoader = UiLoader;

})(window, document);