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
    auxs.settingsModel = { servos: ko.observableArray([])};
    this.enable = function () {
      auxs.settingsModel.servos().forEach(function(servo) {
        if (servo.enabled()) {
          var headsUpName = 'aux-servo.' + servo.name();
          auxs.cockpit.emit('headsUpMenu.enable', headsUpName);
        }
      });
      auxs.auxSettings.show();
    };
    this.disable = function () {
      auxs.settingsModel.servos().forEach(function(servo) {
        var headsUpName = 'aux-servo.' + servo.name();
        auxs.cockpit.emit('headsUpMenu.disable', headsUpName);
      });
      auxs.auxSettings.hide();
    };

    var registerHeadsUpMenuItem = function(servo) {
      var shouldTrigger = true;
      var leftInterval = null;
      var rightInterval = null;
      var moveRight = function(curentValue) {
            var newValue = parseInt(curentValue) + parseInt(servo.stepWidth());
            console.log(newValue);
            if (newValue > servo.max()) {
              newValue = servo.max();
            }
            servo.setValue(newValue);
            curentValue = newValue;
            return curentValue
          };
      var moveLeft = function(curentValue) {
            var newValue = curentValue - servo.stepWidth();
            if (newValue < servo.min()) {
              newValue = servo.min();
            }
            servo.setValue(newValue);
            curentValue = newValue;
            return curentValue;
          };

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
          var curentValue = servo.currentValue();
          if (leftInterval) { clearInterval(leftInterval);}
          curentValue  = moveLeft(curentValue);
          leftInterval = setInterval(function() { 
            if (leftInterval) curentValue  = moveLeft(curentValue);
          }, 100);

        },
        leftUp: function() {
          clearInterval(leftInterval);
          leftInterval = null;
        },
        right: function () {
          shouldTrigger = false;
          var curentValue = servo.currentValue();
          if(rightInterval) { clearInterval(rightInterval); }
          curentValue  = moveRight(curentValue) 
          rightInterval = setInterval(function() { 
            if (rightInterval) curentValue  = moveRight(curentValue) 
          }, 100);
        },
        rightUp: function() {
          clearInterval(rightInterval);
          rightInterval = null;
        }
      };
      if (auxs.cockpit.extensionPoints.headsUpMenu) {
        auxs.cockpit.extensionPoints.headsUpMenu.register(item);
      }

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
    cockpit.extensionPoints.rovSettings.append('<div id="auxServo-settings"></div>');
    auxs.auxSettings = cockpit.extensionPoints.rovSettings.find('#auxServo-settings');
    auxs.auxSettings.load(jsFileLocation + '../settings.html', function () {
      var body = $('body');
      body.append('<div id="auxServo-templates"></div>');
      body.find('#auxServo-templates')
        .load(jsFileLocation + '../templates.html', function() {
          ko.applyBindings(auxs.settingsModel, auxs.auxSettings[0]);
        });
    });

    return auxs;
  };

  auxServoNs.AuxServo.prototype.listen = function listen() {
    var self = this;

    self.cockpit.on('plugin.aux-servo.config', function(config) {
      self.cockpit.rov.emit('plugin.aux-servo.config', config);
    });

    self.cockpit.on('plugin.aux-servo.execute', function(command) {
      self.cockpit.rov.emit('plugin.aux-servo.execute', command);
    });

    self.cockpit.rov.on('plugin.aux-servo.executed', function(result) {
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