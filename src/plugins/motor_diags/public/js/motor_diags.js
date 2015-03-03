/*jshint multistr: true*/
(function (window, $, undefined) {
  'use strict';
  var Motor_diags;
  Motor_diags = function Motor_diags(cockpit) {
    console.log('Loading Motor_diags plugin in the browser.');
    // Instance variables
    this.cockpit = cockpit;
    this.portMotorSpeed = ko.observable(0);
    this.portMotorSlide = ko.observable(false);
    this.starbordMotorSpeed = ko.observable(0);
    this.starbordMotorSlide = ko.observable(false);
    this.verticalMotorSpeed = ko.observable(0);
    this.verticalMotorSlide = ko.observable(false);
    this.reversePortThruster = ko.observable();
    this.reverseStarbordThruster = ko.observable();
    this.reverseLiftThruster = ko.observable();
    this.diagnosticMotors = ko.observableArray([
      {
        name: 'Port Motor',
        propertyName: 'portMotorSpeed',
        reversePropertyName: 'reversePortThruster'
      },
      {
        name: 'Starboard Motor',
        propertyName: 'starbordMotorSpeed',
        reversePropertyName: 'reverseStarbordThruster'
      },
      {
        name: 'Vertical Motor',
        propertyName: 'verticalMotorSpeed',
        reversePropertyName: 'reverseLiftThruster'
      }
    ]);
    this.diagnosticMotorSpeedButtons = [
      -1,
      0,
      1
    ];
    // Add required UI elements
    this.cockpit.extensionPoints.rovSettings.append('<div id="runtimePanel">');
    this.cockpit.extensionPoints.rovDiagnostics.append('<div id="diagpanel"></div>');
    var self = this;
    var jsFileLocation = urlOfJsFile('motor_diags.js');
    // the js folder path
    this.diagPanel = this.cockpit.extensionPoints.rovDiagnostics.find('#diagpanel');

    this.diagPanel.load(jsFileLocation + '../diagpanel.html', function () {
      self.setupSliders();
      self.loaded();
      self.cockpit.extensionPoints.rovDiagnostics.registerCloseHandler(function () {
        self.SaveDiagnostics();
      });
      self.SaveDiagnostics(); // initial save so the settings are sent to arduinos

    });
    this.cockpit.extensionPoints.rovSettings.find('#runtimePanel').load(jsFileLocation + '../settings.html', function () {
      cockpit.extensionPoints.rovSettings.registerCloseHandler(function () {
        self.SaveSettings();
      });
    });
  };

  Motor_diags.prototype.loaded = function() {
    var motordiag = this;
    this.cockpit.rov.on('settings', function (data) {
      motordiag.LoadSettings(data);
    });
    this.cockpit.extensionPoints.rovDiagnostics.find('#callibrate_escs').click(function () {
      motordiag.cockpit.rov.emit('callibrate_escs');
      console.log('callibrate_escs sent');
    });
    motordiag.portMotorSpeed.subscribe(function (newValue) {
      if (!motordiag.portMotorSlide()) {
        motordiag.diagPanel.find('#portMotorSpeed')[0].value = newValue;
      }
      motordiag.sendTestMotorMessage();
    });
    motordiag.starbordMotorSpeed.subscribe(function (newValue) {
      if (!motordiag.starbordMotorSlide()) {
        motordiag.diagPanel.find('#starbordMotorSpeed')[0].value = newValue;
      }
      motordiag.sendTestMotorMessage();
    });
    motordiag.verticalMotorSpeed.subscribe(function (newValue) {
      if (!motordiag.verticalMotorSlide()) {
        motordiag.diagPanel.find('#verticalMotorSpeed')[0].value = newValue;
      }
      motordiag.sendTestMotorMessage();
    });
  };
  Motor_diags.prototype.setupSliders = function() {
    var motordiag = this;

    Polymer.import(['/bower_components/paper-slider/paper-slider.html'], function() {
      var port = motordiag.diagPanel.find('#portMotorSpeed');
      port.on('immediate-value-change', function() {
        motordiag.portMotorSlide(true);
        motordiag.portMotorSpeed(port[0].immediateValue);
        motordiag.portMotorSlide(false);
      });
      var starbord = motordiag.diagPanel.find('#starbordMotorSpeed');
      starbord.on('immediate-value-change', function() {
        motordiag.starbordMotorSlide(true);
        motordiag.starbordMotorSpeed(starbord[0].immediateValue);
        motordiag.starbordMotorSlide(false);
      });
      var vertical = motordiag.diagPanel.find('#verticalMotorSpeed');
      vertical.on('immediate-value-change', function() {
        motordiag.verticalMotorSlide(true);
        motordiag.verticalMotorSpeed(vertical[0].immediateValue);
        motordiag.verticalMotorSlide(false);
      });
    });
    ko.applyBindings(this, motordiag.diagPanel[0]);
  };
  Motor_diags.prototype.sendTestMotorMessage = function sendTestMotorMessage() {
    var portVal = this.portMotorSpeed();
    var starbordVal = this.starbordMotorSpeed();
    var verticalVal = this.verticalMotorSpeed();
    this.cockpit.rov.emit('plugin.motorDiag.motorTest', {
      port: portVal,
      starbord: starbordVal,
      vertical: verticalVal
    });
  };
  Motor_diags.prototype.setMotorTestSpeed = function setMotorTestSpeed(propertyName, value) {
    this[propertyName](value);
  };
  Motor_diags.prototype.LoadSettings = function LoadSettings(settings) {
    var motordiag = this;
    if ('reverse_port_thruster' in settings)
      this.reversePortThruster(settings.reverse_port_thruster);
    if ('reverse_starbord_thruster' in settings)
      this.reverseStarbordThruster(settings.reverse_starbord_thruster);
    if ('reverse_lift_thruster' in settings)
      this.reverseLiftThruster(settings.reverse_lift_thruster);
    if ('smoothingIncriment' in settings)
      motordiag.cockpit.extensionPoints.rovDiagnostics.find('#smoothingIncriment').val(settings.smoothingIncriment);
  };
  Motor_diags.prototype.SaveDiagnostics = function() {
    this.cockpit.rov.emit('update_settings', { reverse_port_thruster: this.reversePortThruster() });
    this.cockpit.rov.emit('update_settings', { reverse_starbord_thruster: this.reverseStarbordThruster() });
    this.cockpit.rov.emit('update_settings', { reverse_lift_thruster: this.reverseLiftThruster() });
  };
  Motor_diags.prototype.SaveSettings = function() {
    var motordiag = this;
    this.cockpit.rov.emit('update_settings', { smoothingIncriment: motordiag.cockpit.extensionPoints.rovDiagnostics.find('#smoothingIncriment').val() });
  };
  window.Cockpit.plugins.push(Motor_diags);
}(window, jQuery));
