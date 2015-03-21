(function() {
  /*
    This plugin enables the user to select the UI Theme that is
    used for the UI.
    
   */

  var UiSelector = function(cockpit) {
    var self = this;
    this.model = new BindingModel(window.Cockpit.UIs);

    this.model.on('apply', function(selectedUI) {
      $.post(
        '/plugin/ui-selector/selectedUi/' + selectedUI.name,
        function() {
          location.reload();
        });
    });

    var jsFileLocation = urlOfJsFile('ui-selector.js');
    var settings = cockpit.extensionPoints.rovSettings
      .append('<div id="selectorConfig"></div>')
      .find('#selectorConfig');
    settings.load(jsFileLocation + '../settings.html', function() {
      ko.applyBindings(self.model, settings[0]);
    });
  };

  UiSelector.prototype.listen = function() {
    var self = this;
    $.get('/plugin/ui-selector', function (config) {
      if (config.selectedUi) {
        self.model.setSelectedUiByName(config.selectedUi);
      }
    });
  };

  var BindingModel = function(availableUis) {
    var self = this;
    this.availableUIs = ko.observableArray(availableUis);
    this.selectedUi = ko.observable();
    this.apply = function() {
      this.emit('apply', this.selectedUi());
    };

    this.setSelectedUiByName = function(name) {
      var newUI = this.availableUIs().filter(function(item) {
        return item.name === name;
      });
      if (newUI && newUI.length > 0) {
        self.selectedUi(newUI[0]);
      }
    };

    return this;
  };
  BindingModel.prototype = new EventEmitter2();
  BindingModel.prototype.constructor = BindingModel;


  window.Cockpit.plugins.push(UiSelector);
})();