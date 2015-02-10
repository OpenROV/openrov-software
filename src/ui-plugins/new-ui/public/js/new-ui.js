(function (window, $, undefined) {
  'use strict';

  var Ui = function(cockpit) {
// for plugin management:
    this.name = 'new-ui';   // for the settings
    this.viewName = 'New UI'; // for the UI
    this.canBeDisabled = true; //allow enable/disable
    this.defaultEnabled = false;
    this.enable = function () {
      loadNewUi();
    };
    this.disable = function () {
      alert('new ui disabled');
    };

    function loadNewUi() {

      var jsFileLocation = urlOfJsFile('new-ui.js');

      Polymer.import([jsFileLocation + '../new-ui.html'], function() {

        var body = $('body');
        var children = body.children();
        body.append('<div id="oldChildren"></div>');
        children.appendTo('#oldChildren');

        body.append('<div id="UI" class="full-height"><x-newui id="new-ui"></x-newui></div>');
        $('#new-ui')[0].setMenu($('#menuitems'));
        $('#new-ui')[0].setSettingsPanel($('#settings'));
        $('#oldChildren').empty();
      });
    }
  };
  window.Cockpit.plugins.push(Ui);
}(window, jQuery));