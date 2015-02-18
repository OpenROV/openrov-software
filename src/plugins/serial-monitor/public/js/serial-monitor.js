(function (window, $, undefined) {
  'use strict';
  var SerialMonitor;
  SerialMonitor = function SerialMonitor(cockpit) {
    console.log('Loading SerialMonitor plugin in the browser.');
    // Instance variables
    this.cockpit = cockpit;
    $('html /deep/ #rov_status_panel').append('<serial-monitor class="hidden" style=""></serial-monitor>');
    var serialMonitorPanel = $('html /deep/ #rov_status_panel serial-monitor');
    cockpit.extensionPoints.keyboardInstructions.append('<p><i>u</i> to toggle raw serial-monitor</p>');
    var self = this;

    // Toggle serial monitor
    this.cockpit.emit('inputController.register',
      {
        name: "serialMonitor.toggleSerialMonitor",
        description: "Shows/hides raw serial monitor.",
        defaults: { keyboard: 'u' },
        down: function() {
          serialMonitorPanel.toggleClass('hidden');
          self.cockpit.socket.emit('plugin.serial-monitor.toggle');
        }
      });
    this.cockpit.messaging.register({
      toSocket: ['plugin.serial-monitor.toggle'],
      fromSocket: [
        {name: 'plugin.serial-monitor.serial-received', signature: ['value']}
      ]
    });
  };

  //This pattern will hook events in the cockpit and pull them all back
  //so that the reference to this instance is available for further processing
  SerialMonitor.prototype.listen = function listen() {
  };
  window.Cockpit.plugins.push(SerialMonitor);
}(window, jQuery));