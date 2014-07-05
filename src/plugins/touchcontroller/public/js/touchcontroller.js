(function (window, $, undefined) {
  'use strict';
  var Touchcontroller;
  var is_touch_device = 'ontouchstart' in document.documentElement;
  if (!is_touch_device)
    return;
  function setupGameController(cockpit) {
    $('#outter-videocontainer').append('<canvas id="touchcontroller" class="row-fluid full-height testoverlay"></canvas>');
    GameController.init({
      canvas: 'touchcontroller',
      left: {
        type: 'dpad',
        position: {
          left: '15%',
          bottom: '15%'
        },
        dpad: {
          touchMove: function (details) {
            cockpit.emit('rovpilot.setThrottle', details.normalizedY);
            cockpit.emit('rovpilot.setYaw', details.normalizedX);
            console.log(details.dx);
            console.log(details.dy);
            console.log(details.max);
            console.log(details.normalizedX);
            console.log(details.normalizedY);
          }
        }
      },
      bottom: {
        type: 'dpad',
        position: {
          right: '15%',
          bottom: '15%'
        },
        dpad: {
          touchMove: function (details) {
            cockpit.emit('setLift', details.normalizedY);
          }
        }
      },
      right: {
        type: 'buttons',
        position: {
          right: '25%',
          bottom: '15%'
        },
        buttons: [
          {
            label: 'lights',
            fontSize: 13,
            radius: '7%',
            stroke: 2,
            backgroundColor: 'blue',
            fontColor: '#fff',
            offset: {
              x: '-10%',
              y: 0
            },
            touchStart: function () {
              cockpit.emit('rovpilot.toggleLights');
            }
          },
          {
            label: 'up',
            fontSize: 13,
            radius: '7%',
            stroke: 2,
            backgroundColor: 'blue',
            fontColor: '#fff',
            offset: {
              x: '-25%',
              y: '-15%'
            },
            touchStart: function () {
              cockpit.emit('rovpilot.setLift', 1);
            },
            touchEnd: function () {
              cockpit.emit('rovpilot.setLift', 0);
            }
          },
          {
            label: 'down',
            fontSize: 13,
            radius: '7%',
            stroke: 2,
            backgroundColor: 'blue',
            fontColor: '#fff',
            offset: {
              x: '-25%',
              y: '0%'
            },
            touchStart: function () {
              cockpit.emit('rovpilot.setLift', -1);
            },
            touchEnd: function () {
              cockpit.emit('rovpilot.setLift', 0);
            }
          },
          {
            label: 'C-UP',
            fontSize: 10,
            radius: '5%',
            stroke: 2,
            backgroundColor: 'blue',
            fontColor: '#fff',
            offset: {
              x: '5%',
              y: '-15%'
            },
            touchStart: function () {
              cockpit.emit('rovpilot.adjustCameraTilt', 0.1);
            }
          },
          {
            label: 'C-CEN',
            fontSize: 10,
            radius: '5%',
            stroke: 2,
            backgroundColor: 'blue',
            fontColor: '#fff',
            offset: {
              x: '5%',
              y: '-5%'
            },
            touchStart: function () {
              cockpit.emit('rovpilot.setCameraTilt', 0);
            }
          },
          {
            label: 'C-DWN',
            fontSize: 10,
            radius: '5%',
            stroke: 2,
            backgroundColor: 'blue',
            fontColor: '#fff',
            offset: {
              x: '5%',
              y: '4%'
            },
            touchStart: function () {
              cockpit.emit('rovpilot.adjustCameraTilt', -0.1);
            }
          },
          {
            label: 'laser',
            fontSize: 13,
            radius: '7%',
            stroke: 2,
            backgroundColor: 'blue',
            fontColor: '#fff',
            offset: {
              x: '-10%',
              y: '-15%'
            },
            touchStart: function () {
              cockpit.emit('rovpilot.toggleLasers');
            }
          }
        ]
      }
    });
  }

  Touchcontroller = function Touchcontroller(cockpit) {
    console.log('Loading Touchcontroller plugin in the browser.');
    if (!is_touch_device)
      return;
    setupGameController(cockpit);

    // Instance variables
    this.cockpit = cockpit;
    $(document).trigger('resize');
    // Add required UI elements
    // for plugin management:
    this.name = 'touchcontroller';
    // for the settings
    this.viewName = 'Touch controller';
    // for the UI
    this.canBeDisabled = true;
    this.enable = function () {
      $('#touchcontroller.real').show();
    };
    this.disable = function () {
      $('#touchcontroller.real').hide();
    };
  };
  window.Cockpit.plugins.push(Touchcontroller);
}(window, jQuery));