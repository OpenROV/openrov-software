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
        description: "Example menu",
        callback: function () {
          alert('example menu item from heads up menu');
        }
      });
      cockpitEventEmitter.emit('headsUpMenu.register', {
        description: "Example menu 2",
        callback: function () {
          alert('example menu item from heads up menu 2');
        }
      });
    });
  };
  window.Cockpit.plugins.push(Example);
}(window, jQuery));