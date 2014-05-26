/*jshint multistr: true*/
(function (window, document, undefined) {
  'use strict';
  var DiveProfile;
  DiveProfile = function (cockpit) {
    console.log('Adding Compass to Artificial Horizon.');
    // Instance variables
    this.cockpit = cockpit;
    // Add required UI elements
    $('#diagnostic H4:contains(\'Callibration\')').after('<a href="#" class="btn" id="toggle_watertype">Switch Water Type</a>');
    // Listen to navdata updates
    var self = this;
    $('#toggle_watertype').click(function () {
      self.cockpit.socket.emit('depth_togglewatertype');
    });
  };
  window.Cockpit.plugins.push(DiveProfile);
}(window, document, undefined));
