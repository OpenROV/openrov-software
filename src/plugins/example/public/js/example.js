(function (window, $, undefined) {
  'use strict';
  var Example;
  Example = function Example(cockpit) {
    console.log('Loading example plugin in the browser.');
    // Instance variables
    this.cockpit = cockpit;
    // Add required UI elements
    $('#menu').prepend('<div id="example" class="hidden">[example]</div>');

    cockpitEventEmitter.on('cockpit.pluginsLoaded', function() {
      var item = {
        label: ko.observable("Example menu")
      };
      item.callback = function () {
          alert('example menu item from heads up menu');
          item.label( item.label() +" Foo Bar");
      };

      cockpitEventEmitter.emit('headsUpMenu.register', item);

      cockpitEventEmitter.emit('headsUpMenu.register', {
        type: "custom",
        content: '<button class="btn btn-large btn-info btn-block" data-bind="click: callback">Custom button</button>',
        callback: function () {
          alert('Message from custom Button');
        }
      });
    });
    // for plugin management:
    this.name = 'example';
    // for the settings
    this.viewName = 'Example plugin';
    // for the UI
    this.canBeDisabled = true;
    // SET THIS TO true to see it working!
    this.enable = function () {
      alert('example enabled');
    };
    this.disable = function () {
      alert('example disabled');
    };
  };
  window.Cockpit.plugins.push(Example);
}(window, jQuery));