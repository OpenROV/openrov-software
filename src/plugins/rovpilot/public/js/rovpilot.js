(function (window, $, undefined) {
  'use strict';
  var ROVpilot;
  var DISABLED = "DISABLED";
  ROVpilot = function ROVpilot(cockpit) {
    console.log('Loading ROVpilot plugin in the browser.');
    // Instance variables
    this.cockpit = cockpit;
    this.power = 0.1;
    //default to mid power
    this.vtrim = 0;
    //default to no trim
    this.ttrim = 0;
    this.tilt = 0;
    this.light = 0;
    this.sendToROVEnabled = true;
    this.positions = {
      throttle: 0,
      yaw: 0,
      lift: 0
    };
    this.sendUpdateEnabled = true;
    var SAMPLE_PERIOD = 1000 / CONFIG.sample_freq;
    //ms
    var trimHeld = false;
    this.priorControls = {};

    // Add required UI elements
    $('#menu').prepend('<div id="example" class="hidden">[example]</div>');
    $('#footercontent').prepend('<div class="span1 pull-left"> \t\t\t<h6>Thrust&nbsp;Factor</h6><div class="label badge" id="thrustfactor">&nbsp;</div> \t\t    </div>');
    $('#keyboardInstructions').append('<p>press <i>i</i> to toggle lights</p>');
    $('#keyboardInstructions').append('<p>press <i>[</i> to enable ESCs</p>');
    $('#keyboardInstructions').append('<p>press <i>]</i> to disable ESCs</p>');
    $('#keyboardInstructions').append('<p>press <i>m</i> to toggle heading hold (BETA)</p>');
    $('#keyboardInstructions').append('<p>press <i>n</i> to toggle depth hold (BETA)</p>');
    $('#navtoolbar').append('<li><a href="#" id="rovPilot_laser" class="rovPilot_Indicator"><div id="rovPilot_laserIcon"></div></div></a>');
    $('#navtoolbar').append('<li><a href="#" id="gamepad" class="hidden"><img id="gamepadPopover" src="themes/OpenROV/img/gamepad.png" rel="popover"></a></li>');
    $('#navtoolbar').append('<li id="rovPilot_holdLabel"><span>Hold:</span></li>');
    $('#navtoolbar').append('<li><a href="#" id="rovPilot_depthHold" class="rovPilot_Indicator">Depth</div></a>');
    $('#navtoolbar').append('<li><a href="#" id="rovPilot_headingHold" class="rovPilot_Indicator">Heading</div></a>');

    var rov = this;
    setInterval(function () {
      rov.sendPilotingData();
    }, SAMPLE_PERIOD);
    this.listen();

    // =============== input settings =============
    // Lasers
    rov.cockpit.emit('inputController.register',
      [
        {
          name: "rovPilot.laserToggle",
          description: "Toggles the lasers on or off.",
          defaults: { keyboard: 'l' },
          down: function() { rov.cockpit.emit('rovpilot.toggleLasers'); }
        },

        // lights increment
        {
          name: "rovPilot.adjustLights_increment",
          description: "Makes the ROV lights brighter.",
          defaults: { keyboard: 'p', gamepad: 'DPAD_UP' },
          down: function() { rov.cockpit.emit('rovpilot.adjustLights', 0.1); }
        },

        // lights decrement
        {
          name: "rovPilot.adjustLights_decrement",
          description: "Makes the ROV lights dimmer.",
          defaults: { keyboard: 'o', gamepad: 'DPAD_DOWN' },

          down: function() { rov.cockpit.emit('rovpilot.adjustLights', -0.1); }
        },

        // lights toggle
        {
          name: "rovPilot.toggleLights",
          description: "Toggles the ROV lights on/off.",
          defaults: { keyboard: 'i' },
          down: function() { rov.cockpit.emit('rovpilot.toggleLights'); }
        },

        // camera up/centre/down
        {
          name: "rovPilot.adjustCameraTilt_down",
          description: "Point the camera further down.",
          defaults: { keyboard: 'z', gamepad: 'Y' },
          down: function() { rov.cockpit.emit('rovpilot.adjustCameraTilt', 0.1); }
        },
        {
          name: "rovPilot.adjustCameraTilt_centre",
          description: "Point the camera straight ahead.",
          defaults: { keyboard: 'a', gamepad: 'B' },
          down: function() { rov.cockpit.emit('rovpilot.setCameraTilt', 0); }
        },
        {
          name: "rovPilot.adjustCameraTilt_up",
          description: "Point the camera further up.",
          defaults: { keyboard: 'q', gamepad: 'A' },
          down: function() { rov.cockpit.emit('rovpilot.adjustCameraTilt', -0.1); }
        },

        // All Trim hold toggle
        {
          name: "rovPilot.toogleAllTrimHold",
          description: "Toogle all trim hold functions on/off",
          defaults: { gamepad: 'RB' },
          down: function() { rov.cockpit.emit('rovpilot.toggleAllTrimHold'); }
        },

        // Increment power level
        {
          name: "rovPilot.incrementPowerLevel",
          description: "Increment the thruster power level",
          defaults: { },
          down: function() { rov.cockpit.emit('rovpilot.incrimentPowerLevel'); }
        },

        // All Stop
        {
          name: "rovPilot.allStop",
          description: "Stop all motor action",
          defaults: { keyboard: 'space' },
          down: function() { rov.cockpit.emit('rovpilot.allStop'); }
        },

        // Up / Forward
        {
          name: "rovPilot.moveForward",
          description: "Set throttle forward.",
          defaults: { keyboard: 'up' },
          down: function() { rov.cockpit.emit('rovpilot.setThrottle', 1);},
          up: function() { rov.cockpit.emit('rovpilot.setThrottle', 0); }
        },

        // Throttle axis
        {
          name: "rovPilot.moveThrottle",
          description: "Set throttle via axis input.",
          defaults: { gamepad: 'LEFT_STICK_Y' },
          axis: function (v) { rov.cockpit.emit('rovpilot.setThrottle', -1 * v); }
        },

      // Down / Backwards
        {
          name: "rovPilot.moveBackwards",
          description: "Set throttle backwards (aft).",
          defaults: { keyboard: 'down' },
          down: function() { rov.cockpit.emit('rovpilot.setThrottle', -1); },
          up: function() { rov.cockpit.emit('rovpilot.setThrottle', 0); }
        },

        // yaw
        {
          name: "rovPilot.moveYaw",
          description: "Turn the ROV via axis input.",
          defaults: { gamepad: 'LEFT_STICK_X' },
          axis: function (v) { rov.cockpit.emit('rovpilot.setYaw', v); }
        },

        // left
        {
          name: "rovPilot.moveLeft",
          description: "Turn the ROV to the port side (left).",
          defaults: { keyboard: 'left' },
          down: function() { rov.cockpit.emit('rovpilot.setYaw', -1); },
          up: function() { rov.cockpit.emit('rovpilot.setYaw', 0); }
        },

        // right
        {
          name: "rovPilot.moveRight",
          description: "Turn the ROV to the starboard side (right).",
          defaults: { keyboard: 'right' },
          down: function() { rov.cockpit.emit('rovpilot.setYaw', 1); },
          up: function() { rov.cockpit.emit('rovpilot.setYaw', 0); }
        },

        // lift axis
        {
          name: "rovPilot.moveLift",
          description: "Bring the ROV shallower or deeper via axis input.",
          defaults: { gamepad: 'RIGHT_STICK_Y' },
          axis: function (v) { rov.cockpit.emit('rovpilot.setLift', -1 * v); }
        },
        // Lift up
        {
          name: "rovPilot.moveUp",
          description: "Bring the ROV shallower (up).",
          defaults: { keyboard: 'shift' },
          down: function() { rov.cockpit.emit('rovpilot.setLift', -1); },
          up: function() { rov.cockpit.emit('rovpilot.setLift', 0); }
        },
        // Push down
        {
          name: "rovPilot.moveDown",
          description: "Bring the ROV deeper (down).",
          defaults: { keyboard: 'ctrl' },
          down: function() { rov.cockpit.emit('rovpilot.setLift', 1); },
          up: function() { rov.cockpit.emit('rovpilot.setLift', 0); }
        },

        // power level 1
        {
          name: "rovPilot.powerLevel1",
          description: "Set the power level of the ROV to level 1.",
          defaults: { keyboard: '1' },
          down: function() { rov.cockpit.emit('rovpilot.powerLevel', 1); }
        },
        // power level 2
        {
          name: "rovPilot.powerLevel2",
          description: "Set the power level of the ROV to level 2.",
          defaults: { keyboard: '2' },
          down: function() { rov.cockpit.emit('rovpilot.powerLevel', 2); }
        },
        // power level 3
        {
          name: "rovPilot.powerLevel3",
          description: "Set the power level of the ROV to level 3.",
          defaults: { keyboard: '3' },
          down: function() { rov.cockpit.emit('rovpilot.powerLevel', 3); }
        },
        // power level 4
        {
          name: "rovPilot.powerLevel4",
          description: "Set the power level of the ROV to level 4.",
          defaults: { keyboard: '4' },
          down: function() { rov.cockpit.emit('rovpilot.powerLevel', 4); }
        },
        // power level 5
        {
          name: "rovPilot.powerLevel5",
          description: "Set the power level of the ROV to level 5.",
          defaults: { keyboard: '5' },
          down: function() { rov.cockpit.emit('rovpilot.powerLevel', 5); }
        },

        // vtrim +
        {
          name: "rovPilot.adjustVerticleTrim_increase",
          description: "Increase the vertical trim",
          defaults: { keyboard: '7' },
          down: function() { rov.cockpit.emit('rovpilot.adjustVerticleTrim', 1); }
        },

        // vtrim -
        {
          name: "rovPilot.adjustVerticleTrim_decrease",
          description: "Decrease the vertical trim",
          defaults: { keyboard: '8' },
          down: function() { rov.cockpit.emit('rovpilot.adjustVerticleTrim', -1); }
        },

        // ttrim +
        {
          name: "rovPilot.adjustThrottleTrim_increase",
          description: "Increase the throttle trim",
          defaults: { keyboard: '-' },
          down: function() { rov.cockpit.emit('rovpilot.adjustThrottleTrim', -1); }
        },

        // ttrim -
        {
          name: "rovPilot.adjustThrottleTrim_decrease",
          description: "Decrease the Throttle trim",
          defaults: { keyboard: '0' },
          down: function() { rov.cockpit.emit('rovpilot.adjustThrottleTrim', 1); }
        },

        // Power on ESC
        {
          name: "rovPilot.powerOnESC",
          description: "Switches the ESCs on",
          defaults: { keyboard: '[' },
          down: function() { rov.cockpit.emit('rovpilot.powerOnESCs'); }
        },

        // Power off ESC
        {
          name: "rovPilot.powerOffESC",
          description: "Switches the ESCs off",
          defaults: { keyboard: ']' },
          down: function() { rov.cockpit.emit('rovpilot.powerOffESCs'); }
        },

        // Toggle heading hold
        {
          name: "rovPilot.toggleHeadingHold",
          description: "Toggles the heading hold on/off",
          defaults: { keyboard: 'm' },
          down: function() { rov.cockpit.emit('rovpilot.toggleholdHeading'); }
        },

        // Toggle depth hold
        {
          name: "rovPilot.toggleDepthHold",
          description: "Toggles the depth hold on/off",
          defaults: { keyboard: 'n' },
          down: function() { rov.cockpit.emit('rovpilot.toggleholdDepth');  }
        }
      ]);

    $('#thrustfactor').text(2);
    $('#rovPilot_depthHold').click(function() {
        rov.cockpit.emit('rovpilot.toggleholdDepth');
    });
    $('#rovPilot_headingHold').click(function() {
        rov.cockpit.emit('rovpilot.toggleholdHeading');
    });

    $('#rovPilot_laser').click(function() {
      rov.cockpit.emit('rovpilot.toggleLasers');
    });
  };
  //This pattern will hook events in the cockpit and pull them all back
  //so that the reference to this instance is available for further processing
  ROVpilot.prototype.listen = function listen() {
    var rov = this;
    rov.cockpit.emit('headsUpMenu.register', {
      label: "Toggle Lasers",
      callback: function () {
        rov.cockpit.emit('rovpilot.toggleLasers');
      }
    });

    rov.cockpit.emit('headsUpMenu.register', {
      label: "Toggle Depth hold",
      callback: function () {
        rov.cockpit.emit('rovpilot.toggleholdDepth');
      }
    });

    rov.cockpit.emit('headsUpMenu.register', {
      label: "Toggle Heading hold",
      callback: function () {
        rov.cockpit.emit('rovpilot.toggleholdHeading');
      }
    });

    rov.cockpit.socket.on('status', function (data) {
        rov.UpdateStatusIndicators(data);
    });
    rov.cockpit.on('gamepad.connected', function () {
      $('#gamepad').toggleClass('hidden', false);
    });
    rov.cockpit.on('gamepad.disconnected', function () {
      $('#gamepad').toggleClass('hidden', true);
    });

    rov.cockpit.on('rovpilot.allStop', function () {
      rov.allStop();
    });
    rov.cockpit.on('rovpilot.setThrottle', function (v) {
      rov.setThrottle(v);
    });
    rov.cockpit.on('rovpilot.setYaw', function (v) {
      rov.setYaw(v);
    });
    rov.cockpit.on('rovpilot.setLift', function (v) {
      rov.setLift(v);
    });
    rov.cockpit.on('rovpilot.powerLevel', function (v) {
      rov.powerLevel(v);
    });
    rov.cockpit.on('rovpilot.adjustVerticleTrim', function (v) {
      rov.adjustVerticleTrim(v);
    });
    rov.cockpit.on('rovpilot.adjustThrottleTrim', function (v) {
      rov.adjustThrottleTrim(v);
    });
    rov.cockpit.on('rovpilot.adjustCameraTilt', function (v) {
      rov.adjustCameraTilt(v);
    });
    rov.cockpit.on('rovpilot.setCameraTilt', function (v) {
      rov.setCameraTilt(v);
    });
    rov.cockpit.on('rovpilot.adjustLights', function (v) {
      rov.adjustLights(v);
    });
    rov.cockpit.on('rovpilot.toggleLasers', function (v) {
      rov.toggleLasers();
    });
    rov.cockpit.on('rovpilot.toggleLights', function (v) {
      rov.toggleLights();
    });
    rov.cockpit.on('rovpilot.incrimentPowerLevel', function () {
      rov.incrimentPowerLevel();
    });
    rov.cockpit.on('rovpilot.powerOnESCs', function () {
      rov.powerOnESCs();
    });
    rov.cockpit.on('rovpilot.powerOffESCs', function () {
      rov.powerOffESCs();
    });
    rov.cockpit.on('rovpilot.toggleholdHeading', function () {
      rov.toggleholdHeading();
    });
    rov.cockpit.on('rovpilot.toggleholdDepth', function () {
      rov.toggleholdDepth();
    });
    rov.cockpit.on('rovpilot.manualMotorThrottle', function (p, v, s) {
      rov.manualMotorThrottle(p, v, s);
    });
    rov.cockpit.on('rovpilot.disable', function () {
      rov.disablePilot();
    });
    rov.cockpit.on('rovpilot.enable', function () {
      rov.enablePilot();
    });
  };
  var lastSentManualThrottle = {};
  lastSentManualThrottle.port = 0;
  lastSentManualThrottle.vertical = 0;
  lastSentManualThrottle.starbord = 0;
  ROVpilot.prototype.disablePilot = function disablePilot() {
    this.sendToROVEnabled = false;
    console.log('disabled rov pilot.');
  };
  ROVpilot.prototype.enablePilot = function enablePilot() {
    this.sendToROVEnabled = true;
    console.log('enabled rov pilot.');
  };
  ROVpilot.prototype.manualMotorThrottle = function manualMotorThrottle(port, vertical, starbord) {
    var maxdiff = 0;
    maxdiff = Math.max(maxdiff, Math.abs(port - lastSentManualThrottle.port));
    maxdiff = Math.max(maxdiff, Math.abs(vertical - lastSentManualThrottle.vertical));
    maxdiff = Math.max(maxdiff, Math.abs(starbord - lastSentManualThrottle.starbord));
    if (vertical < 0)
      vertical = vertical * 2;
    //make up for async props
    if (maxdiff > 0.001) {
      this.cockpit.socket.emit('motor_test', {
        port: -port * this.power,
        starbord: -starbord * this.power,
        vertical: vertical * this.power
      });
      lastSentManualThrottle.port = port;
      lastSentManualThrottle.vertical = vertical;
      lastSentManualThrottle.starbord = starbord;
    }
  };
  ROVpilot.prototype.setCameraTilt = function setCameraTilt(value) {
    this.tilt = value;
    if (this.tilt > 1)
      this.tilt = 1;
    if (this.tilt < -1)
      this.tilt = -1;
    this.cockpit.socket.emit('tilt_update', this.tilt);
  };
  ROVpilot.prototype.adjustCameraTilt = function adjustCameraTilt(value) {
    this.tilt += value;
    this.setCameraTilt(this.tilt);
  };
  ROVpilot.prototype.setLights = function setLights(value) {
    this.light = value;
    if (this.light > 1)
      this.light = 1;
    if (this.light < 0)
      this.light = 0;
    this.cockpit.socket.emit('brightness_update', this.light);
  };
  ROVpilot.prototype.adjustLights = function adjustLights(value) {
    if (this.light === 0 && value < 0) {
      //this code rounds the horn so to speak by jumping from zero to max and vise versa
      this.light = 0;  //disabled the round the horn feature
    } else if (this.light == 1 && value > 0) {
      this.light = 1;  //disabled the round the horn feature
    } else {
      this.light += value;
    }
    this.setLights(this.light);
  };
  ROVpilot.prototype.toggleLasers = function toggleLasers() {
    this.cockpit.socket.emit('laser_update');
  };
  ROVpilot.prototype.toggleLights = function toggleLights() {
    if (this.light > 0) {
      this.setLights(0);
    } else {
      this.setLights(1);
    }
  };
  ROVpilot.prototype.toggleholdHeading = function toggleholdHeading() {
    this.cockpit.socket.emit('holdHeading_toggle');
  };
  ROVpilot.prototype.toggleholdDepth = function toggleholdDepth() {
    this.cockpit.socket.emit('holdDepth_toggle');
  };
  ROVpilot.prototype.powerOnESCs = function powerOnESCs() {
    this.cockpit.socket.emit('escs_poweron');
  };
  ROVpilot.prototype.powerOffESCs = function powerOffESCs() {
    this.cockpit.socket.emit('escs_poweroff');
  };
  ROVpilot.prototype.adjustVerticleTrim = function adjustVerticleTrim(value) {
    this.vtrim += value;
    this.positions.lift = 1 / 1000 * this.vtrim;
  };
  ROVpilot.prototype.adjustThrottleTrim = function adjustThrottleTrim(value) {
    this.ttrim += value;
    this.positions.throttle = 1 / 1000 * this.ttrim;
  };
  ROVpilot.prototype.toggleAllTrimHold = function toggleAllTrimHold() {
    this.trimHeld = !bool;
    if (this.trimHeld) {
      this.ttrim = positions.throttle;
      this.vtrim = positions.throttle;
    }
  };
  ROVpilot.prototype.setThrottle = function setThrottle(value) {
    this.positions.throttle = value;
    if (value === 0)
      this.positions.throttle = this.ttrim;
  };
  ROVpilot.prototype.setLift = function setLift(value) {
    this.positions.lift = value;
    if (value === 0)
      this.positions.lift = this.vtrim;
  };
  ROVpilot.prototype.setYaw = function setYaw(value) {
    this.positions.yaw = value;
  };
  ROVpilot.prototype.incrimentPowerLevel = function incrimentPowerLevel() {
    var currentPowerLevel = $('#thrustfactor').text();
    currentPowerLevel++;
    if (currentPowerLevel > 5)
      currentPowerLevel = 1;
    this.powerLevel(currentPowerLevel);
  };
  ROVpilot.prototype.powerLevel = function powerLevel(value) {
    switch (value) {
    case 1:
      this.power = 0.05;
      break;
    case 2:
      this.power = 0.1;
      break;
    case 3:
      this.power = 0.2;
      break;
    case 4:
      this.power = 0.5;
      break;
    case 5:
      this.power = 1;
      break;
    }
    $('#thrustfactor').text(value);
  };
  ROVpilot.prototype.allStop = function allStop() {
    this.vtrim = 0;
    this.ttrim = 0;
    this.positions.throttle = 0;
    this.positions.yaw = 0;
    this.positions.lift = 0;
  };
  ROVpilot.prototype.sendPilotingData = function sendPilotingData() {
    var positions = this.positions;
    var updateRequired = false;
    //Only send if there is a change
    var controls = {};
    controls.throttle = positions.throttle * this.power;
    controls.yaw = positions.yaw * this.power * 1.5;
    controls.lift = positions.lift * this.power;
    for (var i in positions) {
      if (controls[i] != this.priorControls[i]) {
        updateRequired = true;
      }
    }
    if (this.sendUpdateEnabled && updateRequired || this.sendToROVEnabled === false) {
      if (this.sendToROVEnabled) {
        this.cockpit.socket.emit('control_update', controls);
      }
      this.cockpit.emit('rovpilot.control_update', controls);
      this.priorControls = controls;
    }
  };
  ROVpilot.prototype.UpdateStatusIndicators = function(status) {
    if ('targetDepth' in status) {
     var depthHoldEnabled = (status.targetDepth != DISABLED);
     $('#rovPilot_depthHold').toggleClass('enabled', depthHoldEnabled);
    }
    if ('targetHeading' in status) {
      var headingHoldEnabled = (status.targetHeading != DISABLED);
      $('#rovPilot_headingHold').toggleClass('enabled', headingHoldEnabled);
    }
    if ('claser' in status) {
      var laserEnabled = (status.claser == 255);
      $('#rovPilot_laser').toggleClass('enabled', laserEnabled);
    }
  };
  window.Cockpit.plugins.push(ROVpilot);
}(window, jQuery));
