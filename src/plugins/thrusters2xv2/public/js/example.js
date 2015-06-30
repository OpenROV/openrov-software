
$( document ).ready(function() {
  'use strict';

  /* jshint ignore:start */
  window.examplePlugin = this;
  // to prevent intererence, we disable this plugin.
  // to see the things working, comment the following statement
  return;

  /* jshint ignore:end */
  var Example;
  Example = function Example(cockpit) {

    console.log('Loading example plugin in the browser.');

    this.cockpit = cockpit;
    // Add required UI elements
    cockpit.extensionPoints.menu.append('<li><a href="/#"><div id="example">Example</div></a></li>');
    cockpit.extensionPoints.menu.find('#example').click(function() {
      alert('Example plugin.\nThere will be a message sent to the ROV in 5 seconds.');
      setTimeout(function() {
        cockpit.rov.emit('plugin.example.foo');
      }, 5000);
    });

    cockpit.rov.on('plugin.example.message', function(message) {
      alert(message);
    });

    var showMessageFoo = true;
    cockpit.rov.on('plugin.example.example_foo', function(data) {
      if (showMessageFoo) {
        showMessageFoo = false;
        alert('Message from arduino "example_foo": ' + data);
        cockpit.rov.emit('plugin.example.example_to_bar', 'foobar');
      }
    });

    var showMessageBar = true;
    cockpit.rov.on('plugin.example.example_bar', function(data) {
      if (showMessageBar) {
        showMessageBar = false;
        alert('Message from arduino "example_bar": ' + data);
      }
    });

    self.cockpit.extensionPoints.inputController.register(
      [{
        name: 'example.keyBoardMapping',
        description: 'Example for keymapping.',
        defaults: { keyboard: 'alt+0', gamepad: 'X' },
        down: function() { console.log('0 down'); },
        up: function() { console.log('0 up'); },
        secondary: [
          {
            name: 'example.keyBoardMappingDepdent',
            dependency: 'example.keyBoardMapping',
            defaults: { keyboard: '9', gamepad: 'RB' },
            down: function() { console.log('####'); }
          }
        ]
      },
        {
          name: 'example.testMessage',
          description: 'another example',
          defaults: { keyboard: 'alt+t' },
          down: function() {
            showMessageFoo = true;
            showMessageBar = true;
            cockpit.rov.emit('plugin.example.example_to_foo', 'abc'); }
        }]);

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
    var item = {
      label: ko.observable('Example menu'),
      callback: function () {
        alert('example menu item from heads up menu');
        item.label(this.label() + ' Foo Bar');
      }
    };
    if (this.cockpit.extensionPoints.headsUpMenu) {
      this.cockpit.extensionPoints.headsUpMenu.register(item);
    }
  };
  window.Cockpit.plugins.push(Example);
});
