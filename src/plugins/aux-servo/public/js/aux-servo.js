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

    auxs.settingsModel = { servos: ko.observableArray([])};

    var registerHeadsUpMenuItem = function(servo) {
      var item = {
        name: 'aux-servo.' + servo.name(),
        enabled: servo.enabled, // pass the enabled observable over to the headsup menu
        label: ko.observable('Aux servo ' + servo.name()),
        callback: function () {
          alert('example menu item from heads up menu');
        },
        left: function () {
        },
        right: function () {
        }
      };
      auxs.cockpit.emit('headsUpMenu.register', item);
    };

    var loadServo = function(servoConfig) {
      var servo = auxServoNs.Servo.fromJs(auxs.cockpit, servoConfig);
      auxs.settings.set(servo.name(), servo.toJs());
      auxs.settingsModel.servos.push(servo);

      servo.enabled.subscribe(function(isEnabled) {
        var headsUpName = 'aux-servo.' + servo.name();
        if ( isEnabled) { auxs.cockpit.emit('headsUpMenu.enable', headsUpName)}
        else { auxs.cockpit.emit('headsUpMenu.disable', headsUpName) }
      });
      registerHeadsUpMenuItem(servo);
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
  };

  window.Cockpit.plugins.push(auxServoNs.AuxServo);
}(window, jQuery));