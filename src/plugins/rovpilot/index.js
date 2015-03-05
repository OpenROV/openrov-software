(function() {
  var DISABLED = 'DISABLED';

  var ROVPilot = function ROVPilot(deps) {
    console.log('The rovpilot plugin.');
    var self = this;
    self.SAMPLE_PERIOD = 1000 / deps.config.sample_freq;

    self.rov = deps.rov;
    self.powerLevel = 2;
    self.sendToROVEnabled = true;
    self.sendUpdateEnabled = true;
    self.power = 0.25;
    self.priorControls = {};
    self.vtrim = 0;
    self.ttrim = 0;

    self.positions = {
      throttle: 0,
      yaw: 0,
      lift: 0,
      pitch: 0,
      roll: 0
    };
    self.lastSentManualThrottle = {
      port: 0,
      vertical: 0,
      starbord: 0
    };

    deps.cockpit.on('plugin.rovpilot.allStop', function () {
      self.allStop();
    });

    deps.cockpit.on('plugin.rovpilot.setThrottle', function (value) {
      self.positions.throttle = value;
      if (value === 0) {
          self.positions.throttle = self.ttrim;
      }
    });

    deps.cockpit.on('plugin.rovpilot.setYaw', function (value) {
      self.positions.yaw = value;
    });

    deps.cockpit.on('plugin.rovpilot.setLift', function (value) {
      self.positions.lift = value;
      if (value === 0) {
        self.positions.lift = self.vtrim;
      }
    });

    deps.cockpit.on('plugin.rovpilot.setPitchControl', function (value) {
      self.positions.pitch = value;
    });

    deps.cockpit.on('plugin.rovpilot.setRollControl', function (value) {
      self.positions.roll = value;
    });

    deps.cockpit.on('plugin.rovpilot.setPowerLevel', function (v) {
      self.setPowerLevel(v, deps.cockpit);
    });

    deps.cockpit.on('plugin.rovpilot.adjustVerticalTrim', function (value) {
      self.vtrim += value;
      self.positions.lift = 1 / 1000 * self.vtrim;
    });

    deps.cockpit.on('plugin.rovpilot.adjustThrottleTrim', function (value) {
      self.ttrim += value;
      self.positions.throttle = 1 / 1000 * self.ttrim;
    });

    deps.cockpit.on('plugin.rovpilot.incrementPowerLevel', function () {
      var currentPowerLevel = self.powerLevel;
      currentPowerLevel++;
      if (currentPowerLevel > 5) {
        currentPowerLevel = 1;
      }
      self.setPowerLevel(currentPowerLevel, deps.cockpit);
    });

    deps.cockpit.on('plugin.rovpilot.powerOnESCs', function () {
      self.rov.send('escp(1)');

      deps.cockpit.emit('plugin.rovpilot.esc.enabled'); // should be handled through status
    });

    deps.cockpit.on('plugin.rovpilot.powerOffESCs', function () {
      self.rov.send('escp(0)');

      deps.cockpit.emit('plugin.rovpilot.esc.disabled'); // should be handled through status
    });

    deps.cockpit.on('plugin.rovpilot.headingHold.toggle', function () {
      deps.rov.send('holdHeading_toggle()');
    });

    deps.cockpit.on('plugin.rovpilot.headingHold.set', function (value) {
      deps.rov.send('holdHeading_toggle('+ value +')');
    });

    deps.cockpit.on('plugin.rovpilot.depthHold.toggle', function () {
      deps.rov.send('holdDepth_toggle()');
    });

    deps.cockpit.on('plugin.rovpilot.depthHold.set', function (value) {
      deps.rov.send('holdDepth_toggle('+ value +')');
    });

    deps.cockpit.on('plugin.rovpilot.manualMotorThrottle', function (p, v, s) {
      self.manualMotorThrottle(p, v, s);
    });
    deps.cockpit.on('plugin.rovpilot.disable', function () {
      self.sendToROVEnabled = false;
    });
    deps.cockpit.on('plugin.rovpilot.enable', function () {
      self.sendToROVEnabled = true;
    });

    deps.cockpit.on('plugin.rovpilot.powerLevel.request', function() {
      self.setPowerLevel(self.powerLevel, deps.cockpit);
    });

    // Arduino
    deps.rov.on('status', function (status) {
      var enabled;
      if ('targetDepth' in status) {
        enabled = status.targetDepth != DISABLED;
        deps.cockpit.emit('plugin.rovpilot.depthHold.' + (enabled ? 'enabled' : 'disabled'));
      }
      if ('targetHeading' in status) {
        enabled = status.targetHeading != DISABLED;
        deps.cockpit.emit('plugin.rovpilot.headingHold.' + (enabled ? 'enabled' : 'disabled'));
        if (enabled) {
          deps.cockpit.emit('plugin.rovpilot.headingHold.target', status.targetHeading);
        }
      }
    });

    this.startInterval  = function() {
      setInterval(
        function() {
          self.sendPilotingData();
        },
        100);
    };

    this.startInterval();

    return this;
  };
  
  ROVPilot.prototype.allStop = function allStop() {
    this.vtrim = 0;
    this.ttrim = 0;
    this.positions.throttle = 0;
    this.positions.yaw = 0;
    this.positions.lift = 0;
    this.positions.pitch = 0;
    this.positions.roll = 0;
  };

  ROVPilot.prototype.setPowerLevel = function setPowerLevel(value, socket) {

    switch (value) {
      case 1:
        this.power = 0.12;
        break;
      case 2:
        this.power = 0.25;
        break;
      case 3:
        this.power = 0.40;
        break;
      case 4:
        this.power = 0.70;
        break;
      case 5:
        this.power = 1;
        break;
    }
    socket.emit('plugin.rovpilot.powerLevel', value);
    this.powerLevel = value;
  };


  ROVPilot.prototype.sendPilotingData = function() {
    var positions = this.positions;
    var updateRequired = false;
    //Only send if there is a change
    var controls = {};
    controls.throttle = positions.throttle * this.power;
    controls.yaw = positions.yaw * this.power * 1.5;
    controls.yaw = Math.min(Math.max(controls.yaw, -1), 1);
    controls.lift = positions.lift * this.power;
    controls.pitch = positions.pitch;
    controls.roll = positions.roll;
    for (var i in positions) {
      if (controls[i] != this.priorControls[i]) {
        updateRequired = true;
        break;
      }
    }
    if (this.sendUpdateEnabled && updateRequired || this.sendToROVEnabled === false) {
      if (this.sendToROVEnabled) {
        for(var control in controls){
          if(controls[control] != this.priorControls[control]){
            var command = control + '(' + controls[control] * 100+ ')';
            this.rov.send(command);
            console.log(command);
          }
        }
      }
      this.rov.sendCommand(controls.throttle, controls.yaw, controls.lift);
      this.priorControls = controls;
    }
  };

  ROVPilot.prototype.manualMotorThrottle = function manualMotorThrottle(port, vertical, starbord) {
    var maxdiff = 0;
    maxdiff = Math.max(maxdiff, Math.abs(port - this.lastSentManualThrottle.port));
    maxdiff = Math.max(maxdiff, Math.abs(vertical - this.lastSentManualThrottle.vertical));
    maxdiff = Math.max(maxdiff, Math.abs(starbord - this.lastSentManualThrottle.starbord));
    if (vertical < 0)
      vertical = vertical * 2;
    //make up for async props
    if (maxdiff > 0.001) {

      this.rov.sendMotorTest(
        -port * this.power,
        -starbord * this.power,
        vertical * this.power);

      this.lastSentManualThrottle.port = port;
      this.lastSentManualThrottle.vertical = vertical;
      this.lastSentManualThrottle.starbord = starbord;
    }
  };

  module.exports = function (name, deps) {
    return new ROVPilot(deps);
  };

})();