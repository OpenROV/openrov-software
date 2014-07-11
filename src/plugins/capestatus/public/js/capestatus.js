(function (window, $, undefined) {
  'use strict';
  var Capestatus;
  Capestatus = function Capestatus(cockpit) {
    var self = this;
    console.log('Loading Capestatus plugin in the browser.');
    self.cockpit = cockpit;
    self.lastPing = null;

    self.bindingModel = {
      cockpit: self.cockpit,
      theLocaltime: ko.observable("localtime"),
      formattedRunTime: ko.observable('runtime'),
      currentCpuUsage: ko.observable(''),
      currentVoltage: ko.observable(0),
      currentCurrent: ko.observable(''),
      isConnected: ko.observable(false),
      brightnessLevel: ko.observable('level0'),
      servoAngle: ko.observable(0),
      batteryLevel: self.batteryLevel
    };

    // Add required UI elements
    var jsFileLocation = urlOfJsFile('capestatus.js');
    $('body').append('<div id="capestatus-templates"></div>');
    $('#capestatus-templates').load(jsFileLocation + '../ui-templates.html', function () {
      $('#footercontent').prepend('<div id="capestatus_footercontent" data-bind="template: {name: \'template_capestatus_footercontent\'}"></div>');
      ko.applyBindings(self.bindingModel, document.getElementById('capestatus_footercontent'));

      // these don't belong here IMHO as the rovPilot controls them
      $('#servoTilt').attr("data-bind", "template: { name: 'template_capestatus_servotilt' }");
      $('#navtoolbar').append('<li id="brightnessIndicator" data-bind="attr: { class: $data.brightnessLevel }" ></li>');
      ko.applyBindings(self.bindingModel, document.getElementById('brightnessIndicator'));
      ko.applyBindings(self.bindingModel, document.getElementById('servoTilt'));
    });

    // Register the various event handlers
    self.listen();
    setInterval(function () {
      self.updateConnectionStatus();
      self.bindingModel.theLocaltime(new Date().toLocaleTimeString());
    }, 1000);

  };
  //This pattern will hook events in the cockpit and pull them all back
  //so that the reference to this instance is available for further processing
  Capestatus.prototype.listen = function listen() {
    var capes = this;
    this.cockpit.socket.on('status', function (data) {
      capes.UpdateStatusIndicators(data);
    });
  };
  Capestatus.prototype.batteryLevel = function batteryLevel(voltage) {
    if (voltage < 9)
      return 'level1';
    if (voltage < 10)
      return 'level2';
    if (voltage < 10.5)
      return 'level3';
    if (voltage < 11.5)
      return 'level4';
    return 'level5';
  };
  Capestatus.prototype.UpdateStatusIndicators = function UpdateStatusIndicators(data) {
    var self = this;
    if ('time' in data) {
      self.bindingModel.formattedRunTime(msToTime(data.time));
    }

    if ('vout' in data) {
      self.bindingModel.currentVoltage(data.vout.toFixed(1));
    }

    if ('iout' in data)
      self.bindingModel.currentCurrent(data.iout.toFixed(3) + 'A');

    if ('servo' in data) {
      var angle = 90 / 500 * data.servo * -1 - 90;
      self.bindingModel.servoAngle(angle);
      console.log('servo angle: ' + angle);
    }

    if ('cpuUsage' in data)
      self.bindingModel.currentCpuUsage((data.cpuUsage * 100).toFixed(0) + '%');

    if ('LIGP' in data)
      self.bindingModel.brightnessLevel('level' + Math.ceil(data.LIGP * 10));

    this.lastPing = new Date();
  };
  Capestatus.prototype.updateConnectionStatus = function () {
    var self = this;
    var now = new Date();
    var delay = now - this.lastPing;

    self.bindingModel.isConnected(delay <= 3000);
  };
  window.Cockpit.plugins.push(Capestatus);

}(window, jQuery));