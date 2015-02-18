/*jshint multistr: true*/
(function (window, document, undefined) {
  'use strict';
  var DiveProfile;
  DiveProfile = function (cockpit) {
    console.log('Adding Compass to Artificial Horizon.');
    // Instance variables
    this.cockpit = cockpit;
    // Add required UI elements
    var calibrations = cockpit.extensionPoints.rovDiagnostics.find('#calibrations');
    calibrations.append('<a href="#" class="btn" style="z-index: 100" id="toggle_watertype">Switch Water Type</a>');
    // Listen to navdata updates
    var self = this;
    cockpit.extensionPoints.rovDiagnostics.find('#toggle_watertype').click(function () {
      self.cockpit.emit('plugin.diveprofile.watertype.toggle');
    });

    cockpit.messaging.register({
      toSocket: ['plugin.diveprofile.watertype.toggle']
    });
  };
  window.Cockpit.plugins.push(DiveProfile);
}(window, document, undefined));
