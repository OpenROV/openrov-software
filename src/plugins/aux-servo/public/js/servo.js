var auxServoNs = namespace('pluginlugin.auxServo');
auxServoNs.Servo = function(eventEmitter, name, pin, enabled) {
  'use strict';
  var self = this;
  self.eventEmitter = eventEmitter;

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
  self.currentValue = ko.observable(self.midPoint());
  self.executing = ko.observable(false);

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
    self.eventEmitter.emit('plugin.aux-servo.config', self.toJs());
    self.isChanged(false);
  };

  self.setValue = function(newValue) {
    self.executing(true);
    self.eventEmitter.emit('plugin.aux-servo.execute', {
      pin: self.pin(),
      value: newValue
    });
    console.log(newValue);
  };

  self.executeTest = function() {
    self.isExecuted(false);
    self.eventEmitter.emit('plugin.aux-servo.execute', {
      pin: self.pin(),
      value: self.testValue()
    });
  };

  self.executed = function(newValue) {
    self.isExecuted(true);
    self.executing(false);
    setTimeout(function() { self.isExecuted(false); }, 2000);
    self.currentValue(newValue);
  };

  return self;
};
auxServoNs.Servo.fromJs = function(eventEmitter, jsObject) {
  var servo = new auxServoNs.Servo(eventEmitter, jsObject.name, jsObject.pin, jsObject.enabled);
  if (jsObject.min !== undefined) servo.min(jsObject.min);
  if (jsObject.max !== undefined) servo.max(jsObject.max);
  if (jsObject.midPoint !== undefined) servo.midPoint(jsObject.midPoint);
  if (jsObject.stepWidth !== undefined) servo.stepWidth(jsObject.stepWidth);
  servo.apply();
  return servo;
};
auxServoNs.Servo.prototype.toJs = function() {
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
