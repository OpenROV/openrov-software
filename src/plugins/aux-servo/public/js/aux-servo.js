(function (window, $, undefined) {
  'use strict';

  var AuxServo;
  AuxServo = function AuxServo(cockpit) {
    var auxs = this;
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

    var Servo = function(name, pin, enabled) {
      var self = this;
      self.name = ko.observable(name);
      self.pin = ko.observable(pin);
      self.enabled = ko.observable(enabled);
      self.min = ko.observable(0);
      self.max = ko.observable(180);
      self.midPoint = ko.observable(90);
      self.stepWidth = ko.observable(1);
      self.isChanged = ko.observable(false);
      self.showTest = ko.observable(false);
      self.testValue = ko.observable(90);
      self.liveTest = ko.observable(false);
      self.showApllied = ko.observable(false);
      self.isExecuted = ko.observable(false);
      self.currentValue = ko.observable(0);

      var isChanged = function() {
        self.isChanged(true);
      };

      self.min.subscribe(isChanged);
      self.max.subscribe(isChanged);
      self.midPoint.subscribe(isChanged);
      self.stepWidth.subscribe(isChanged);
      self.testValue.subscribe(function() { if (self.liveTest()) { self.executeTest(); } });
      self.isChanged.subscribe(function(newValue) {
        if (newValue === false) {
          self.showApllied(true);
          setTimeout(function () {self.showApllied(false); }, 2000);
        }
      });

      self.toggleTestVisible = function() {
        self.showTest(! self.showTest() );
      };

      self.apply = function() {
        console.log('Applying new Aux servo settings');
        cockpit.emit('auxservo-config', {
          pin: self.pin(),
          min: self.min(),
          max: self.max(),
          midPoint: self.midPoint(),
          stepWidth: self.stepWidth()
        });
        self.isChanged(false);
      };

      self.executeTest = function() {
        console.log("Executing test on aux servo " + self.name() + "with value: " + self.testValue());
        self.isExecuted(false);
        cockpit.emit('auxservo-execute', {
          pin: self.pin(),
          value: self.testValue()
        });
      };

      self.executed = function(newValue) {
        self.isExecuted(true);
        setTimeout(function() { self.isExecuted(false); }, 2000);
        self.currentValue(newValue);
      };

      return self;
    };

    auxs.settingsModel = {
      servo1: new Servo('1', 13, true),
      servo2: new Servo('2', 14, false)
    };
    auxs.settingsModel.servos = [auxs.settingsModel.servo1, auxs.settingsModel.servo2];

    // Add required UI elements
    var jsFileLocation = urlOfJsFile('aux-servo.js');
    $('#plugin-settings').append('<div id="auxServo-settings"></div>');
    $('#auxServo-settings').load(jsFileLocation + '../settings.html', function () {
      ko.applyBindings(auxs.settingsModel, $('#auxServo-settings')[0]);
    });

    return auxs;
  };


  AuxServo.prototype.listen = function listen() {
    var self = this;

    self.cockpit.on('auxservo-config', function(config) {
      self.cockpit.socket.emit('auxservo-config', config);
    });

    self.cockpit.on('auxservo-execute', function(command) {
      self.cockpit.socket.emit('auxservo-execute', command);
    });

    self.cockpit.socket.on('auxservo-executed', function(result) {
      var subParts = result.split(',');
      self.settingsModel.servos.forEach(function(servo) {
        console.log("AUX SERVO " + servo.pin() + " " + subParts[0]);
        if (servo.pin() == parseInt(subParts[0])) {
          servo.executed(subParts[1]);
        }
      });
    });


/*
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
 */

  };

  ko.bindingHandlers.fadeVisible = {
    init: function(element, valueAccessor) {
      // Initially set the element to be instantly visible/hidden depending on the value
      var value = valueAccessor();
      $(element).toggle(ko.utils.unwrapObservable(value)); // Use "unwrapObservable" so we can handle values that may or may not be observable
    },
    update: function(element, valueAccessor) {
      // Whenever the value subsequently changes, slowly fade the element in or out
      var value = valueAccessor();
      ko.utils.unwrapObservable(value) ? $(element).fadeIn() : $(element).fadeOut();
    }
  };
  window.Cockpit.plugins.push(AuxServo);
}(window, jQuery));