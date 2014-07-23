(function (window, $, undefined) {
  'use strict';

  var AuxServo;
  AuxServo = function AuxServo(cockpit) {

    console.log('Loading the auxiliary servo plugin.');

    // Instance variables
    this.cockpit = cockpit;
    // Add required UI elements

    // for plugin management:
    this.name = 'auxServo';   // for the settings
    this.viewName = 'Auxiliary servo'; // for the UI
    this.canBeDisabled = true; //allow enable/disable
    this.enable = function () {
    };
    this.disable = function () {
    };

    self.settingsModel = {
      servo1: { enabled: ko.observable(true) },
      servo2: { enabled: ko.observable(false) }
    };

    // Add required UI elements
    var jsFileLocation = urlOfJsFile('aux-servo.js');
    $('#plugin-settings').append('<div id="auxServo-settings"></div>');
    $('#auxServo-settings').load(jsFileLocation + '../settings.html', function () {
      ko.applyBindings(self.settingsModel, $('#auxServo-settings')[0]);
    });
};

/*
  AuxServo.prototype.listen = function listen() {
    var rov = this;
    var item = {
      counter: 0,
      labelText: "Example menu",
      label: ko.observable(),
      callback: function () {
        alert('example menu item from heads up menu');
      },
      left: function() {
        item.counter = item.counter -1;
        item.label(item.labelText + ' ' + item.counter.toString());
      },
      right: function() {
        item.counter = item.counter +1;
        item.label(item.labelText + ' ' + item.counter.toString());
      }
    };
    item.label(item.labelText);
    rov.cockpit.emit('headsUpMenu.register', item);
  };
 */
  window.Cockpit.plugins.push(AuxServo);
}(window, jQuery));