(function (window, $, undefined) {
  'use strict';
  var Telemetry;
  Telemetry = function Telemetry(cockpit) {
    console.log('Loading Telemetry plugin in the browser.');
    // Instance variables
    this.cockpit = cockpit;
    this.importantTelemetry = {};
    this.textcolor = 0;
    // Add required UI elements
    $('html /deep/ #rov_status_panel').append('');
    cockpit.extensionPoints.keyboardInstructions.append('<p><i>h</i> to cycle text color of telemetry</p>');
  };
  //This pattern will hook events in the cockpit and pull them all back
  //so that the reference to this instance is available for further processing
  Telemetry.prototype.listen = function listen() {
    var self = this;
    this.cockpit.socket.on('status', function (data) {
      cockpit.emit('plugin.telemetry.logData', data);
    });

    self.cockpit.emit('inputController.register',
      {
        name: "telemetry.cycleTextColor",
        description: "Cycle the text color of telemetry.",
        defaults: { keyboard: 'h' },
        down: function() { cockpit.emit('plugin.telemetry.cycleTextColor'); }
      });

  };
  window.Cockpit.plugins.push(Telemetry);
}(window, jQuery));