(function (window, $) {
  'use strict';
  var ROVpilot;
  ROVpilot = function ROVpilot(cockpit) {
    console.log('Loading ROVpilot plugin in the browser.');
    var rov = this;
    // Instance variables
    rov.cockpit = cockpit;

    rov.powerLevel = 2;

    $('#keyboardInstructions')
      .append('<p>press <i>i</i> to toggle lights</p>')
      .append('<p>press <i>[</i> to enable ESCs</p>')
      .append('<p>press <i>]</i> to disable ESCs</p>')
      .append('<p>press <i>m</i> to toggle heading hold (BETA)</p>')
      .append('<p>press <i>n</i> to toggle depth hold (BETA)</p>');

    // =============== input settings =============
    rov.cockpit.extensionPoints.inputController.register(
      [
        // All Trim hold toggle
        {
          name: "rovPilot.toggleAllTrimHold",
          description: "Toggle all trim hold functions on/off",
          defaults: { gamepad: 'RB' },
          down: function () {
            rov.cockpit.rov.emit('rovpilot.toggleAllTrimHold');
          }
        },

        // Increment power level
        {
          name: "rovPilot.incrementPowerLevel",
          description: "Increment the thruster power level",
          defaults: { },
          down: function () {
            rov.cockpit.rov.emit('rovpilot.incrementPowerLevel');
          }
        },

        // Up / Forward
        {
          name: "rovPilot.moveForward",
          description: "Set throttle forward.",
          defaults: { keyboard: 'up' },
          down: function () {
            rov.cockpit.rov.emit('rovpilot.setThrottle', 1);
          },
          up: function () {
            rov.cockpit.rov.emit('rovpilot.setThrottle', 0);
          }
        },

        // Throttle axis
        {
          name: "rovPilot.moveThrottle",
          description: "Set throttle via axis input.",
          defaults: { gamepad: 'LEFT_STICK_Y' },
          axis: function (v) {
            rov.cockpit.rov.emit('rovpilot.setThrottle', -1 * v);
          }
        },

        // Down / Backwards
        {
          name: "rovPilot.moveBackwards",
          description: "Set throttle backwards (aft).",
          defaults: { keyboard: 'down' },
          down: function () {
            rov.cockpit.rov.emit('rovpilot.setThrottle', -1);
          },
          up: function () {
            rov.cockpit.rov.emit('rovpilot.setThrottle', 0);
          }
        },

        // yaw
        {
          name: "rovPilot.moveYaw",
          description: "Turn the ROV via axis input.",
          defaults: { gamepad: 'LEFT_STICK_X' },
          axis: function (v) {
            rov.cockpit.rov.emit('rovpilot.setYaw', v);
          }
        },

        // left
        {
          name: "rovPilot.moveLeft",
          description: "Turn the ROV to the port side (left).",
          defaults: { keyboard: 'left' },
          down: function () {
            rov.cockpit.rov.emit('rovpilot.setYaw', -1);
          },
          up: function () {
            rov.cockpit.rov.emit('rovpilot.setYaw', 0);
          }
        },

        // right
        {
          name: "rovPilot.moveRight",
          description: "Turn the ROV to the starboard side (right).",
          defaults: { keyboard: 'right' },
          down: function () {
            rov.cockpit.rov.emit('rovpilot.setYaw', 1);
          },
          up: function () {
            rov.cockpit.rov.emit('rovpilot.setYaw', 0);
          }
        },

        // lift axis
        {
          name: "rovPilot.moveLift",
          description: "Bring the ROV shallower or deeper via axis input.",
          defaults: { gamepad: 'RIGHT_STICK_Y' },
          axis: function (v) {
            rov.cockpit.rov.emit('rovpilot.setLift', -1 * v);
          }
        },
        // Lift up
        {
          name: "rovPilot.moveUp",
          description: "Bring the ROV shallower (up).",
          defaults: { keyboard: 'shift' },
          down: function () {
            rov.cockpit.rov.emit('rovpilot.setLift', -1);
          },
          up: function () {
            rov.cockpit.rov.emit('rovpilot.setLift', 0);
          }
        },
        // Push down
        {
          name: "rovPilot.moveDown",
          description: "Bring the ROV deeper (down).",
          defaults: { keyboard: 'ctrl' },
          down: function () {
            rov.cockpit.rov.emit('rovpilot.setLift', 1);
          },
          up: function () {
            rov.cockpit.rov.emit('rovpilot.setLift', 0);
          }
        },

        // power level 1
        {
          name: "rovPilot.powerLevel1",
          description: "Set the power level of the ROV to level 1.",
          defaults: { keyboard: '1' },
          down: function () {
            rov.cockpit.rov.emit('rovpilot.setPowerLevel', 1);
          }
        },
        // power level 2
        {
          name: "rovPilot.powerLevel2",
          description: "Set the power level of the ROV to level 2.",
          defaults: { keyboard: '2' },
          down: function () {
            rov.cockpit.rov.emit('rovpilot.setPowerLevel', 2);
          }
        },
        // power level 3
        {
          name: "rovPilot.powerLevel3",
          description: "Set the power level of the ROV to level 3.",
          defaults: { keyboard: '3' },
          down: function () {
            rov.cockpit.rov.emit('rovpilot.setPowerLevel', 3);
          }
        },
        // power level 4
        {
          name: "rovPilot.powerLevel4",
          description: "Set the power level of the ROV to level 4.",
          defaults: { keyboard: '4' },
          down: function () {
            rov.cockpit.rov.emit('rovpilot.setPowerLevel', 4);
          }
        },
        // power level 5
        {
          name: "rovPilot.powerLevel5",
          description: "Set the power level of the ROV to level 5.",
          defaults: { keyboard: '5' },
          down: function () {
            rov.cockpit.rov.emit('rovpilot.setPowerLevel', 5);
          }
        },
        // vtrim +
        {
          name: "rovPilot.adjustVerticalTrim_increase",
          description: "Increase the vertical trim",
          defaults: { keyboard: '7' },
          down: function () {
            rov.cockpit.rov.emit('rovpilot.adjustVerticalTrim', 1);
          }
        },

        // vtrim -
        {
          name: "rovPilot.adjustVerticalTrim_decrease",
          description: "Decrease the vertical trim",
          defaults: { keyboard: '8' },
          down: function () {
            rov.cockpit.rov.emit('rovpilot.adjustVerticalTrim', -1);
          }
        },

        // ttrim +
        {
          name: "rovPilot.adjustThrottleTrim_increase",
          description: "Increase the throttle trim",
          defaults: { keyboard: '0' },
          down: function() { rov.cockpit.rov.emit('rovpilot.adjustThrottleTrim', 1); }
        },

        // ttrim -
        {
          name: "rovPilot.adjustThrottleTrim_decrease",
          description: "Decrease the Throttle trim",
          defaults: { keyboard: '9' },
          down: function() { rov.cockpit.rov.emit('rovpilot.adjustThrottleTrim', -1); }
        },

        // Power on ESC
        {
          name: "rovPilot.powerOnESC",
          description: "Switches the ESCs on",
          defaults: { keyboard: '[' },
          down: function () {
            rov.cockpit.rov.emit('rovpilot.powerOnESCs');
          }
        },

        // Power off ESC
        {
          name: "rovPilot.powerOffESC",
          description: "Switches the ESCs off",
          defaults: { keyboard: ']' },
          down: function () {
            rov.cockpit.rov.emit('rovpilot.powerOffESCs');
          }
        },

        // Toggle heading hold
        {
          name: "rovPilot.toggleHeadingHold",
          description: "Toggles the heading hold on/off",
          defaults: { keyboard: 'm' },
          down: function () {
            rov.cockpit.rov.emit('rovpilot.headingHold.toggle');
          }
        },

        // Toggle depth hold
        {
          name: "rovPilot.toggleDepthHold",
          description: "Toggles the depth hold on/off",
          defaults: { keyboard: 'n' },
          down: function () {
            rov.cockpit.rov.emit('rovpilot.depthHold.toggle');
          }
        }
      ]);
  };
  //This pattern will hook events in the cockpit and pull them all back
  //so that the reference to this instance is available for further processing
  ROVpilot.prototype.listen = function listen() {
    var rov = this;

    rov.cockpit.emit('headsUpMenu.register', [
      {
        label: "Toggle Depth hold",
        callback: function () {
          rov.cockpit.rov.emit('rovpilot.depthHold.toggle');
        }
      },
      {
        label: "Toggle Heading hold",
        callback: function () {
          rov.cockpit.rov.emit('rovpilot.headingHold.toggle');
        }
      },
      {
        label: "Increment power level",
        callback: function () {
          rov.cockpit.rov.emit('rovpilot.incrementPowerLevel');
        }
      }
    ]);

    rov.cockpit.rov.emit('rovpilot.powerLevel.request');
  };
  window.Cockpit.plugins.push(ROVpilot);
}(window, jQuery));
