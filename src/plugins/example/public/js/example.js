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
      cockpitEventEmitter.emit('headsUpMenu.register', {
        label: "Example menu",
        // no type == explicit buttons
        callback: function () {
          alert('example menu item from heads up menu');
        }
      });
      cockpitEventEmitter.emit('headsUpMenu.register', {
        label: "Example menu button",
        type: "button",
        callback: function () {
          alert('example menu item from heads up menu 2');
        }
      });
      cockpitEventEmitter.emit('headsUpMenu.register', {
        type: "custom",
        content: '<button class="btn btn-large btn-info btn-block" data-bind="click: callback">Custom button</button>',
        callback: function () {
          alert('Message from custom Button');
        }
      });

    });
  };
  window.Cockpit.plugins.push(Example);
}(window, jQuery));