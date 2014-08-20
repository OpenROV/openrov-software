(function (window, $, undefined) {
  'use strict';

  var Serialnumber;
  Serialnumber = function Serialnumber(cockpit) {

    console.log('Loading Serialnumber plugin.');

    // Instance variables
    this.cockpit = cockpit;
    // Add required UI elements
    $('#menu').prepend('<div id="example" class="hidden">[example]</div>');

    // for plugin management:
    this.name = 'serialnumber';   // for the settings
    this.viewName = 'Serialnumber plugin'; // for the UI
    this.canBeDisabled = false; //allow enable/disable
    this.enable = function () {
    };
    this.disable = function () {
    };
  };

  window.Cockpit.plugins.push(Serialnumber);
}(window, jQuery));