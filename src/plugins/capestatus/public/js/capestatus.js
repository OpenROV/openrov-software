(function (window, $, undefined) {
  'use strict';
  var capestatus = namespace('plugins.capestatus');
  capestatus.Capestatus = function Capestatus(cockpit) {
    var self = this;
    console.log('Loading Capestatus plugin in the browser.');
    self.cockpit = cockpit;
    self.lastPing = null;
    var Battery = function() {};
    var batteryConfig = new capestatus.BatteryConfig();

    self.settingsModel = {
      batteryTypes: ko.observableArray(),
      batteryType: ko.observable(),
      addNewBatteryVisible: ko.observable(false),
      newBattery: ko.observable(),
      showAddNew: function() {
        this.addNewBatteryVisible(true);
        this.newBattery(new Battery());
      },
      addBattery: function() {
        var model = self.settingsModel;
        var result = ko.validation.group(model.newBattery(), {deep: true});
        if (!model.newBattery().isValid())
        {
          alert("Please fix all errors before preceding");
          result.showAllMessages(true);

          return false;
        }
        model.batteryTypes.push(model.newBattery());
        batteryConfig.addBattery({
          name: model.newBattery().name(),
          minVoltage: parseFloat(model.newBattery().minVoltage()),
          maxVoltage: parseFloat(model.newBattery().maxVoltage()) });

        model.addNewBatteryVisible(false);
      },
      cancelAdd: function() {
        self.settingsModel.addNewBatteryVisible(false);
      },
      removeBattery: function(battery) {
        batteryConfig.deleteBattery({ name: battery.name(),  minVoltage: parseFloat(battery.minVoltage()), maxVoltage: parseFloat(battery.maxVoltage()) });
        self.settingsModel.batteryTypes.remove(battery);
      }
    };

    //add computed
    self.settingsModel.selectedBattery = ko.computed(function(){
      var existing = self.settingsModel.batteryTypes().filter(function(bat) {
        return bat.name() === self.settingsModel.batteryType();
      });
      if (existing.length > 0) { return existing[0]; }
      return null;
    });

    //add manual subscriptions
    self.settingsModel.batteryType.subscribe(function(newValue) {
      batteryConfig.setSelected(newValue);
    });

    var toBatteryConfig = function(battery) {
      if (battery) {
        return {
          name: battery.name(),
          minVoltage: battery.minVoltage(),
          maxVoltage: battery.maxVoltage()
        };
      }
      return { name: '', minVoltage: 0, maxVoltage: 0 };
    };

    self.settingsModel.selectedBattery.subscribe(function(battery) {
      self.cockpit.rov.emit('capestatus.battery.config', toBatteryConfig(battery) );
    });
    self.cockpit.rov.on('capestatus.request.battery.config', function(clb) {
      clb(toBatteryConfig(self.settingsModel.selectedBattery()));
    });

    Battery = function(name, minVoltage, maxVoltage) {
      var bat = this;
      bat.name = ko.observable(name !== undefined ? name : '')
        .extend({
          required: true,
          isUnique: {
            params: {
              array: self.settingsModel.batteryTypes(),
              predicate: function (opt, selectedVal) {
                return ko.utils.unwrapObservable(opt.name) === selectedVal;
              }
            },
            message: "The battery name must be unique!"
          }
        });
      bat.maxVoltage = ko.observable(maxVoltage !== undefined ? maxVoltage : 0);
      bat.minVoltage = ko.observable(minVoltage !== undefined ? minVoltage : 0);
      bat.description = ko.computed(function() {
        return bat.name() + " (min: " + bat.minVoltage() + "v - max: " + bat.maxVoltage() + "v)";
      });

      bat.maxVoltage
        .extend({
          required: true,
          number: true,
          validation: {
            validator: function (val, someOtherVal) {
              return parseFloat(val) > parseFloat(ko.utils.unwrapObservable(someOtherVal));
            },
            message: 'Max voltage must be bigger than Min voltage!',
            params: bat.minVoltage
          }
        });

      bat.minVoltage.extend({
          required: true,
          number: true,
          validation: {
            validator: function (val, someOtherVal) {
              return parseFloat(val) < parseFloat(ko.utils.unwrapObservable(someOtherVal));
            },
            message: 'Min voltage must be smaller than Max voltage!',
            params: bat.maxVoltage
          }

        });
      bat.errors = ko.validation.group(this);

      return bat;
    };

    batteryConfig.getConfig(function(batteryConfig) {
      self.settingsModel.batteryTypes.removeAll();
      batteryConfig.batteries.forEach(function(battery) {
        self.settingsModel.batteryTypes.push(new Battery(battery.name, battery.minVoltage, battery.maxVoltage));
      });
      self.settingsModel.batteryType(batteryConfig.selectedBattery);
    });


    var jsFileLocation = urlOfJsFile('capestatus.js');
    cockpit.extensionPoints.rovSettings.append('<div id="capestatus-settings"></div>');

    var statusSettings = cockpit.extensionPoints.rovSettings.find('#capestatus-settings');
    statusSettings.load(jsFileLocation + '../settings.html', function () {
      ko.applyBindingsWithValidation(
        self.settingsModel,
        statusSettings[0],
        {
          insertMessages: true,
          decorateElement: true,
          errorElementClass: 'error',
          errorMessageClass: 'help-inline',
          errorClass: 'error'
        }
      );
    });

    setInterval(function () {
      self.updateConnectionStatus();
      var now = new Date();
      var nowFormatted = now.toLocaleTimeString();
      self.cockpit.rov.emit('capestatus.time.time', { raw: now, formatted: nowFormatted});
    }, 1000);

  };
  //This pattern will hook events in the cockpit and pull them all back
  //so that the reference to this instance is available for further processing
  capestatus.Capestatus.prototype.listen = function listen() {
    var capes = this;
    this.cockpit.rov.on('status', function (data) {
      capes.UpdateStatusIndicators(data);
    });
  };
  capestatus.Capestatus.prototype.UpdateStatusIndicators = function UpdateStatusIndicators(data) {
    var self = this;

    this.lastPing = new Date();
  };

  capestatus.Capestatus.prototype.updateConnectionStatus = function () {
    var self = this;
    var now = new Date();
    var delay = now - this.lastPing;

    var isConnected = delay <= 3000;

    self.cockpit.rov.emit('capestatus.connection.' + (isConnected ? 'connected' : 'disconnected'));
  };

  window.Cockpit.plugins.push(capestatus.Capestatus);

}(window, jQuery));
