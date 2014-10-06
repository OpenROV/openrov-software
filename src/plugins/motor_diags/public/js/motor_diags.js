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
    $('#settings H4:contains(\'Runtime Settings\')').after('<div class="control-group"> \t\t      <label class="control-label" for="smoothingIncriment">Motor Response Aggressivness:</label> \t\t      <input type="text" id="smoothingIncriment" /> \t\t  </div>');
    $('#diagnostic H3:contains(\'Diagnostics\')').append('<div id="diagpanel"></div>');
    var self = this;
    var jsFileLocation = urlOfJsFile('motor_diags.js');
    // the js folder path
    $('#diagpanel').load(jsFileLocation + '../diagpanel.html', function () { self.loaded(); });
  };
  //This pattern will hook events in the cockpit and pull them all back
  //so that the reference to this instance is available for further processing
  Motor_diags.prototype.loaded = function() {
    var motordiag = this;
    $('#diagnostic .back-button').click(function () {
      motordiag.SaveSettings();
    });
    $('#settings .back-button').click(function () {
      motordiag.SaveSettings2();
    });
    this.cockpit.socket.on('settings', function (data) {
      motordiag.LoadSettings(data);
    });
    $('#callibrate_escs').click(function () {
      motordiag.cockpit.socket.emit('callibrate_escs');
      console.log('callibrate_escs sent');
    });
    motordiag.portMotorSpeed.subscribe(function (newValue) {
      if (!motordiag.portMotorSlide()) {
        $('#portMotorSpeed').slider('value', newValue);
      }
      motordiag.sendTestMotorMessage();
    });
    motordiag.starbordMotorSpeed.subscribe(function (newValue) {
      if (!motordiag.starbordMotorSlide()) {
        $('#starbordMotorSpeed').slider('value', newValue);
      }
      motordiag.sendTestMotorMessage();
    });
    motordiag.verticalMotorSpeed.subscribe(function (newValue) {
      if (!motordiag.verticalMotorSlide()) {
        $('#verticalMotorSpeed').slider('value', newValue);
      }
      motordiag.sendTestMotorMessage();
    });
    var md = this;
    $('#starbordMotorSpeed').slider({
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
    $('#portMotorSpeed').slider({
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
    $('#portMotorSpeedVal').val($('#portMotorSpeed').slider('value'));
    $('#verticalMotorSpeed').slider({
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
    $('#verticalMotorSpeedVal').val($('#verticalMotorSpeed').slider('value'));
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
    ko.applyBindings(md, $('#motordiags')[0]);
  };
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
    if ('reverse_port_thruster' in settings)
      this.reversePortThruster(settings.reverse_port_thruster);
    if ('reverse_starbord_thruster' in settings)
      this.reverseStarbordThruster(settings.reverse_starbord_thruster);
    if ('reverse_lift_thruster' in settings)
      this.reverseLiftThruster(settings.reverse_lift_thruster);
    if ('smoothingIncriment' in settings)
      $('#smoothingIncriment').val(settings.smoothingIncriment);
  };
  Motor_diags.prototype.SaveSettings = function SaveSettings() {
    this.cockpit.socket.emit('update_settings', { reverse_port_thruster: this.reversePortThruster() });
    this.cockpit.socket.emit('update_settings', { reverse_starbord_thruster: this.reverseStarbordThruster() });
    this.cockpit.socket.emit('update_settings', { reverse_lift_thruster: this.reverseLiftThruster() });
  };
  Motor_diags.prototype.SaveSettings2 = function SaveSettings() {
    this.cockpit.socket.emit('update_settings', { smoothingIncriment: $('#smoothingIncriment').val() });
  };
  window.Cockpit.plugins.push(Motor_diags);
}(window, jQuery));
