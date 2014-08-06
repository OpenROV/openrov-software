(function (window, $, undefined) {
  'use strict';
  var auxServoNs = namespace('pluginlugin.auxServo');
  auxServoNs.AuxServo = function (cockpit) {
    var auxs = this;
    console.log('Loading the auxiliary servo plugin.');

    // Instance variables
    this.cockpit = cockpit;
    this.settings = new auxServoNs.Settings();

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
      //object values
      self.name = ko.observable(name);
      self.pin = ko.observable(pin);
      self.enabled = ko.observable(enabled);
      self.min = ko.observable(0);
      self.max = ko.observable(180);
      self.midPoint = ko.observable(90);
      self.stepWidth = ko.observable(1);
      //ui values
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
      self.enabled.subscribe(function() {
        self.showTest(false);
        self.apply();
      });

      self.toggleTestVisible = function() {
        self.showTest(! self.showTest() );
      };

      self.apply = function() {
        console.log('Applying new Aux servo settings');
        cockpit.emit('auxservo-config', self.toJs());
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
    Servo.fromJs = function(jsObject) {
      var servo = new Servo(jsObject.name, jsObject.pin, jsObject.enabled);
      if (jsObject.min !== undefined) servo.min(jsObject.min);
      if (jsObject.max !== undefined) servo.max(jsObject.max);
      if (jsObject.midPoint !== undefined) servo.midPoint(jsObject.midPoint);
      if (jsObject.stepWidth !== undefined) servo.stepWidth(jsObject.stepWidth);
      servo.apply();
      return servo;
    };
    Servo.prototype.toJs = function() {
      var servo = this;
      return {
        name: servo.name(),
        pin: servo.pin(),
        enabled: servo.enabled(),
        min: servo.min(),
        max: servo.max(),
        midPoint: servo.midPoint(),
        stepWidth: servo.stepWidth()
      };
    };

    auxs.settingsModel = { servos: ko.observableArray([])};

    var loadServo = function(servoConfig) {
      var servo = Servo.fromJs(servoConfig);
      auxs.settings.set(servo.name(), servo.toJs());
      auxs.settingsModel.servos.push(servo);
    };

    auxs.settings.get('1', loadServo);
    auxs.settings.get('2', loadServo);

    // Add required UI elements
    var jsFileLocation = urlOfJsFile('aux-servo.js');
    $('#plugin-settings').append('<div id="auxServo-settings"></div>');
    $('#auxServo-settings').load(jsFileLocation + '../settings.html', function () {
      ko.applyBindings(auxs.settingsModel, $('#auxServo-settings')[0]);
    });

    return auxs;
  };


  auxServoNs.AuxServo.prototype.listen = function listen() {
    var self = this;

    self.cockpit.on('auxservo-config', function(config) {
      self.cockpit.socket.emit('auxservo-config', config);
    });

    self.cockpit.on('auxservo-execute', function(command) {
      self.cockpit.socket.emit('auxservo-execute', command);
    });

    self.cockpit.socket.on('auxservo-executed', function(result) {
      var subParts = result.split(',');
      if (self.settingsModel.servos.length > 0) {
        self.settingsModel.servos.forEach(function (servo) {
          console.log("AUX SERVO " + servo.pin() + " " + subParts[0]);
          if (servo.pin() == parseInt(subParts[0])) {
            servo.executed(subParts[1]);
          }
        });
      }
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

  window.Cockpit.plugins.push(auxServoNs.AuxServo);
}(window, jQuery));