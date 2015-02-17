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

    this.cockpit.extensionPoints.rovDiagnostics.append('<style id="jquery-ui-styles"></style>');
    var styles = this.cockpit.extensionPoints.rovDiagnostics.find('#jquery-ui-styles');
    styles.load('/css/ui-lightness/jquery-ui-1.8.23.custom.css');


    this.diagPanel = this.cockpit.extensionPoints.rovDiagnostics.find('#diagpanel');
    this.diagPanel.load(jsFileLocation + '../diagpanel.html', function () {
      self.setupSliders();
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
  //This pattern will hook events in the cockpit and pull them all back
  //so that the reference to this instance is available for further processing
  Motor_diags.prototype.listen = function listen() {
    var motordiag = this;
    this.cockpit.socket.on('settings', function (data) {
      motordiag.LoadSettings(data);
    });
    this.cockpit.extensionPoints.rovDiagnostics.find('#callibrate_escs').click(function () {
      motordiag.cockpit.socket.emit('callibrate_escs');
      console.log('callibrate_escs sent');
    });
    motordiag.portMotorSpeed.subscribe(function (newValue) {
      if (!motordiag.portMotorSlide()) {
        motordiag.diagPanel.find('#portMotorSpeed').slider('value', newValue);
      }
      motordiag.sendTestMotorMessage();
    });
    motordiag.starbordMotorSpeed.subscribe(function (newValue) {
      if (!motordiag.starbordMotorSlide()) {
        motordiag.diagPanel.find('#starbordMotorSpeed').slider('value', newValue);
      }
      motordiag.sendTestMotorMessage();
    });
    motordiag.verticalMotorSpeed.subscribe(function (newValue) {
      if (!motordiag.verticalMotorSlide()) {
        motordiag.diagPanel.find('#verticalMotorSpeed').slider('value', newValue);
      }
      motordiag.sendTestMotorMessage();
    });
  };
  Motor_diags.prototype.setupSliders = function() {
    var md = this;
    var motordiag = this;
    var starboardSlider = motordiag.diagPanel.find('#starbordMotorSpeed');
    starboardSlider.slider({
      min: -1,
      max: 1,
      value: 0,
      step: 0.001,
      slide: function (event, ui) {
        md.starbordMotorSlide(true);
        md.starbordMotorSpeed(ui.value);
        md.starbordMotorSlide(false);
      }
    });
    // $( "#starbordMotorSpeedVal" ).val( $( "#starbordMotorSpeed" ).slider( "value" ) );
    motordiag.diagPanel.find('#portMotorSpeed').slider({
      min: -1,
      max: 1,
      value: 0,
      step: 0.001,
      slide: function (event, ui) {
        md.portMotorSlide(true);
        md.portMotorSpeed(ui.value);
        md.portMotorSlide(false);
      }
    });
    motordiag.diagPanel.find('#portMotorSpeedVal')
      .val(motordiag.diagPanel.find('#portMotorSpeed').slider('value'));
    motordiag.diagPanel.find('#verticalMotorSpeed').slider({
      min: -1,
      max: 1,
      value: 0,
      step: 0.001,
      slide: function (event, ui) {
        md.verticalMotorSlide(true);
        md.verticalMotorSpeed(ui.value);
        md.verticalMotorSlide(false);
      }
    });
    motordiag.diagPanel.find('#verticalMotorSpeedVal')
      .val(motordiag.diagPanel.find('#verticalMotorSpeed').slider('value'));
    ko.bindingHandlers.slider = {
      init: function (element, valueAccessor, allBindingsAccessor) {
        var options = allBindingsAccessor().sliderOptions || {};
        var sliderValues = ko.utils.unwrapObservable(valueAccessor());
        if (sliderValues.min !== undefined) {
          options.range = true;
          options.values = [
            0,
            0
          ];
        }
        options.slide = function (e, ui) {
          if (sliderValues.min) {
            sliderValues.min(ui.values[0]);
            sliderValues.max(ui.values[1]);
          } else {
            valueAccessor()(ui.value);
          }
        };
        ko.utils.domNodeDisposal.addDisposeCallback(element, function () {
          $(element).slider('destroy');
        });
        $(element).slider(options);
      },
      update: function (element, valueAccessor) {
        var sliderValues = ko.toJS(valueAccessor());
        if (sliderValues.min !== undefined) {
          $(element).slider('values', [
            sliderValues.min,
            sliderValues.max
          ]);
        } else {
          $(element).slider('value', sliderValues);
        }
      }
    };
    ko.applyBindings(this, motordiag.diagPanel[0]);
  }
  Motor_diags.prototype.sendTestMotorMessage = function sendTestMotorMessage() {
    var portVal = this.portMotorSpeed();
    var starbordVal = this.starbordMotorSpeed();
    var verticalVal = this.verticalMotorSpeed();
    this.cockpit.socket.emit('motor_test', {
      port: portVal,
      starbord: starbordVal,
      vertical: verticalVal
    });
  };
  Motor_diags.prototype.setMotorTestSpeed = function setMotorTestSpeed(propertyName, value) {
    this[propertyName](value);
  };
  Motor_diags.prototype.LoadSettings = function LoadSettings(settings) {
    if ('deadzone_pos' in settings)
      motordiag.cockpit.extensionPoints.rovDiagnostics.find('#deadzone_pos').val(settings.deadzone_pos);
    if ('deadzone_neg' in settings)
      motordiag.cockpit.extensionPoints.rovDiagnostics.find('#deadzone_neg').val(settings.deadzone_neg);
    if ('reverse_port_thruster' in settings)
      this.reversePortThruster(settings.reverse_port_thruster);
    if ('reverse_starbord_thruster' in settings)
      this.reverseStarbordThruster(settings.reverse_starbord_thruster);
    if ('reverse_lift_thruster' in settings)
      this.reverseLiftThruster(settings.reverse_lift_thruster);
    if ('smoothingIncriment' in settings)
      motordiag.cockpit.extensionPoints.rovDiagnostics.find('#smoothingIncriment').val(settings.smoothingIncriment);
  };
  Motor_diags.prototype.SaveDiagnostics = function SaveDiagnostics() {
    this.cockpit.socket.emit('update_settings', { deadzone_pos: motordiag.cockpit.extensionPoints.rovDiagnostics.find('#deadzone_pos').val() });
    this.cockpit.socket.emit('update_settings', { deadzone_neg: motordiag.cockpit.extensionPoints.rovDiagnostics.find('#deadzone_neg').val() });
    this.cockpit.socket.emit('update_settings', { reverse_port_thruster: this.reversePortThruster() });
    this.cockpit.socket.emit('update_settings', { reverse_starbord_thruster: this.reverseStarbordThruster() });
    this.cockpit.socket.emit('update_settings', { reverse_lift_thruster: this.reverseLiftThruster() });
  };
  Motor_diags.prototype.SaveSettings = function SaveDiagnostics() {
    this.cockpit.socket.emit('update_settings', { smoothingIncriment: motordiag.cockpit.extensionPoints.rovDiagnostics.find('#smoothingIncriment').val() });
  };
  window.Cockpit.plugins.push(Motor_diags);
}(window, jQuery));
