(function (window, $, undefined) {
  'use strict';
  var FlyByWire;
  FlyByWire = function Example(cockpit) {
    console.log('Loading FlyByWire plugin in the browser.');
    // Instance variables
    this.cockpit = cockpit;
    this.flybywireControlActive = false;
    this.originalsettings = {};
    this.leftx = 0;
    this.lefty = 0;
    this.rightx = 0;
    this.righty = 0;
    this.lift = 0;
    this.targetHeading = 0;
    this.targetDepth = 0;
    this.targetThrottle = 0;
    this.maxDegreeOfHeadingChange = 5;
    this.maxDepthChange = 0.1;
    // Add required UI elements
    $('#keyboardInstructions').append('<p><i>g</i> to toggle flybywire</p>');
  };
  FlyByWire.prototype.listen = function listen() {
    var rov = this;

    // Toggle fly-by-wire
    this.cockpit.emit('inputController.register',
      {
        name: "flyByWire.toggle",
        description: "Enables/disable fly-by-wire.",
        defaults: { keyboard: 'g' },
        down: function() { rov.toggleControl();  }
      });

    rov.cockpit.on('rovpilot.control_update', function (controls) {
      if (rov.flybywireControlActive) {
        rov.processControlChanges(controls);
      }
    });
  };
  FlyByWire.prototype.processControlChanges = function processControlChanges(controls) {
    if (controls.throttle != this.targetThrottle) {
      this.targetThrottle = controls.throttle;
      this.cockpit.socket.emit('thro', controls.throttle);
    }
    if (controls.yaw !== 0) {
      this.targetHeading += this.maxDegreeOfHeadingChange * controls.yaw;
      if (this.targetHeading >= 360)
        this.targetHeading -= 360;
      if (this.targetHeading < 0)
        this.targetHeading += 360;
      this.cockpit.socket.emit('holdHeading_on', this.targetHeading);
    }
    if (controls.lift !== 0) {
      if (controls.lift < 0 && this.targetDepth <= 0)
        return;
      this.targetDepth += this.maxDepthChange * controls.lift;
      if (this.targetDepth < 0)
        this.targetDepth = 0;
      this.cockpit.socket.emit('holdDepth_on', this.targetDepth);
    }
  };
  FlyByWire.prototype.toggleControl = function toggleControl() {
    var rov = this;
    if (!this.flybywireControlActive) {
      rov.cockpit.emit('rovpilot.disable');

      rov.cockpit.emit('rovpilot.toggleholdHeading');
      rov.cockpit.emit('rovpilot.toggleholdDepth');

      rov.flybywireControlActive = true;
      console.log('FlyByWire Control Active');
    } else {

      rov.flybywireControlActive = false;
      rov.cockpit.emit('rovpilot.enable');
      rov.cockpit.emit('rovpilot.toggleholdHeading');
      rov.cockpit.emit('rovpilot.toggleholdDepth');
      console.log('FlyByWire Control Deactivated');
    }
  };
  window.Cockpit.plugins.push(FlyByWire);
}(window, jQuery));
