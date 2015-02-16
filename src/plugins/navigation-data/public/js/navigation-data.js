(function(window) {
  'use strict';
  var plugins = namespace('plugins');
  plugins.NavigatoinData = function(cockpit) {
    var self = this;
    self.cockpit = cockpit;
  };

  //This pattern will hook events in the cockpit and pull them all back
  //so that the reference to this instance is available for further processing
  plugins.NavigatoinData.prototype.listen = function listen() {
    var self = this;

    // register the messages that should be transfered from and to the socket
    self.cockpit.messaging.register({
      fromSocket: [
        { name: 'plugin.navigationData.data', signature: ['data']}
      ]
    });

  };

  window.Cockpit.plugins.push(plugins.NavigatoinData);

})(window);