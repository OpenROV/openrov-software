(function (window, $, undefined) {
  'use strict';

  // to prevent intererence, we disable this plugin.
  // to see the things working, comment the following statement
  return;

  var Example;
  Example = function Example(cockpit) {

    console.log('Loading example plugin in the browser.');

    this.cockpit = cockpit;
    // Add required UI elements
    cockpit.extensionPoints.menu.append('<li><a href="/#"><div id="example">Example</div></a></li>');
    cockpit.extensionPoints.menu.find('#example').click(function() {
      alert('Example plugin.\nThere will be a message sent to the ROV in 5 seconds.')
      setTimeout(function() {
        cockpit.emit('plugin.example.foo');
      }, 5000)
    });

    cockpit.messaging.register({
      toSocket: [ // what will we send to the ROV?
        'plugin.example.foo',
        { name: 'plugin.example.bar', signature: ['param1', 'param2'] } // for messages with values
      ],
      fromSocket: [ // what will we receive from the ROV?
        { name: 'plugin.example.message', signature: ['message'] }
      ]
    });

    this.cockpit.emit('inputController.register',
      {
        name: "example.keyBoardMapping",
        description: "Example for keymapping.",
        defaults: { keyboard: 'alt+0', gamepad: 'X' },
        down: function() { console.log('0 down'); },
        up: function() { console.log('0 up'); },
        secondary: [
          {
            name: "example.keyBoardMappingDepdent",
            dependency: "example.keyBoardMapping",
            defaults: { keyboard: '9', gamepad: 'RB' },
            down: function() { console.log('####'); }
          }
        ]
      });

    // for plugin management:
    this.name = 'example';   // for the settings
    this.viewName = 'Example plugin'; // for the UI
    this.canBeDisabled = true; //allow enable/disable
    this.enable = function () {
      alert('example enabled');
    };
    this.disable = function () {
      alert('example disabled');
    };
  };

  Example.prototype.listen = function listen() {
    var rov = this;
    var item = {
      label: ko.observable("Example menu"),
      callback: function () {
        alert('example menu item from heads up menu');
        item.label(this.label() + " Foo Bar");
      }
    };
    rov.cockpit.emit('headsUpMenu.register', item);

    rov.cockpit.on('plugin.example.message', function(message) {
      alert('received message from rov: ' + message);
    })

  };
  window.Cockpit.plugins.push(Example);
}(window, jQuery));