$( document ).ready(function() {
  'use strict';

  window.examplePlugin = this;
  // to prevent intererence, we disable this plugin.
  // to see the things working, comment the following statement
  return;


  var Example;
  Example = function Example(cockpit) {

    console.log('Loading example plugin in the browser.');

    // Instance variables
    this.cockpit = cockpit;
    // Add required UI elements
    $('#menu').prepend('<div id="example" class="hidden">[example]</div>');

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

  };
  window.Cockpit.plugins.push(Example);
});