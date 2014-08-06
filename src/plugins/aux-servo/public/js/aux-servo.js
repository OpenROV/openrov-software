(function (window, $, undefined) {
  'use strict';
  var auxServoNs = namespace('pluginlugin.auxServo');
  auxServoNs.AuxServo = function (cockpit) {
    var auxs = this;
    console.log('Loading the auxiliary servo plugin.');

    // Instance variables
    this.cockpit = cockpit;
    this.settings = new auxServoNs.Settings();

    // for plugin management:
    this.name = 'auxServo';   // for the settings
    this.viewName = 'Auxiliary servo'; // for the UI
    this.canBeDisabled = true; //allow enable/disable
    this.enable = function () {
    };
    this.disable = function () {
    };

    auxs.settingsModel = { servos: ko.observableArray([])};

    var registerHeadsUpMenuItem = function(servo) {
      var shouldTrigger = true;
      var item = {
        name: 'aux-servo.' + servo.name(),
        enabled: servo.enabled, // pass the enabled observable over to the headsup menu
        type: 'custom',
        servo: servo,
        percentage: ko.computed(function() {
          var value = ((servo.max() - servo.min()) / (servo.max() - parseInt(servo.currentValue())));
          var percentage = 100;
          if (value > 0) { percentage = 100 - (100/value); }
          return percentage.toString() + "%";
        }),
        content: "<button class='btn btn-large btn-block'>Aux Servo <span data-bind='text: $data.servo.name'></span>:<div class='progress active' data-bind=\"css: { 'progress-striped': $data.servo.executing() }\"><div class='bar' data-bind='style: { width: $data.percentage() }'></div></div></button>",
        callback: function () {
          if (shouldTrigger) {
            servo.setValue(servo.midPoint());
          }
          shouldTrigger = true;
        },
        left: function () {
          shouldTrigger = false;
          var newValue = servo.currentValue() - servo.stepWidth();
          if (newValue < servo.min()) {
            newValue = servo.min();
          }
          servo.setValue(newValue);
        },
        right: function () {
          shouldTrigger = false;
          var newValue = parseInt(servo.currentValue()) + parseInt(servo.stepWidth());
          console.log(newValue);
          if (newValue > servo.max()) {
            newValue = servo.max();
          }
          servo.setValue(newValue);
        }
      };
      auxs.cockpit.emit('headsUpMenu.register', item);
    };

    var loadServo = function(servoConfig) {
      var servo = auxServoNs.Servo.fromJs(auxs.cockpit, servoConfig);
      auxs.settings.set(servo.name(), servo.toJs()); // writeback to make sure we have all values
      auxs.settingsModel.servos.push(servo);

      servo.enabled.subscribe(function(isEnabled) {
        var headsUpName = 'aux-servo.' + servo.name();
        if ( isEnabled) { auxs.cockpit.emit('headsUpMenu.enable', headsUpName)}
        else { auxs.cockpit.emit('headsUpMenu.disable', headsUpName) }
      });
      registerHeadsUpMenuItem(servo);
      if (servo.enabled()) {
        servo.setValue(servo.midPoint());
      }
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
      if (self.settingsModel.servos().length > 0) {
        self.settingsModel.servos().forEach(function (servo) {
          if (servo.pin() == subParts[0]) {
            servo.executed(subParts[1]);
          }
        });
      }
    });
  };

  window.Cockpit.plugins.push(auxServoNs.AuxServo);
}(window, jQuery));