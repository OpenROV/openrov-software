(function (window, $, undefined) {
  'use strict';
  var HeadsUpMenu;
  HeadsUpMenu = function HeadsUpMenu(cockpit) {
    console.log('Loading HeadsUpMenu plugin in the browser.');
    this.cockpit = cockpit;

    // Add required UI elements
    $('#menu').prepend('<div id="example" class="hidden">[example]</div>');

    // for plugin management:
    this.name = "headsup-menu" // for the settings
    this.viewName = "Heads up menu"; // for the UI
    this.canBeDisabled = true;
    this.enable = function() { /* to be done */ };
    this.disable = function() { /* to be done */ };
  };
  window.Cockpit.plugins.push(HeadsUpMenu);
}(window, jQuery));