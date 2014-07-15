(function (window, $, undefined) {
  'use strict';
  var SerialMonitor;
  var MAX_LINES = 100;
  SerialMonitor = function SerialMonitor(cockpit) {
    console.log('Loading SerialMonitor plugin in the browser.');
    // Instance variables
    this.cockpit = cockpit;
    // Add required UI elements
    $('#rov_status_panel').append('<div id="serialmonitor" style="display: none;" class="controller well well-small" >\t\t    <textarea id="SerialMonitorList" style="width: 100%; height: 400px;">\t\t    </textarea>\t\t</div>');
    $('#keyboardInstructions').append('<p><i>u</i> to toggle raw serial-monitor</p>');
    var self = this;

    // Toggle serial monitor
    this.cockpit.emit('inputController.register',
      {
        name: "serialMonitor.toggleSerialMonitor",
        description: "Shows/hides raw serial monitor.",
        defaults: { keyboard: 'u' },
        down: function() {
          $('#serialmonitor').toggle();
          self.cockpit.socket.emit('SerialMonitor_toggle_rawSerial');
        }
      });

  };
  SerialMonitor.prototype.countNewlines = function countNewlines(haystack) {
    return this.count('\n', haystack);
  };
  SerialMonitor.prototype.count = function count(needle, haystack) {
    var num = 0, len = haystack.length;
    for (var i = 0; i < len; i++) {
      if (haystack.charAt(i) === needle) {
        num++;
      }
    }
    return num;
  };
  SerialMonitor.prototype.tail = function tail(limit, haystack) {
    var lines = this.countNewlines(haystack) + 1;
    if (lines > limit) {
      return haystack.split('\n').slice(-limit).join('\n');
    }
    return haystack;
  };
  //This pattern will hook events in the cockpit and pull them all back
  //so that the reference to this instance is available for further processing
  SerialMonitor.prototype.listen = function listen() {
    var self = this;
    this.cockpit.socket.on('serial-recieved', function (data) {
      //console.log('Got Serial Data');
      //self.displaySerialMonitor(data);
      //$('#SerialMonitorList').append(data);
      var text = self.tail(MAX_LINES, $('#SerialMonitorList').val() + data);
      $('#SerialMonitorList').val(text);
      $('#SerialMonitorList').scrollTop($('#SerialMonitorList')[0].scrollHeight);
    });
  };
  SerialMonitor.prototype.displaySerialMonitor = function displaySerialMonitor(data) {
    $('SerialMonitorList').append(data);
  };
  window.Cockpit.plugins.push(SerialMonitor);
}(window, jQuery));