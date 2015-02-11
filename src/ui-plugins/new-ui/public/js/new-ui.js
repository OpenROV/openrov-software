(function (window, $, undefined) {
  'use strict';

  var Ui = function NewUI(cockpit) {
    this.name = 'new-ui';   // for the settings
    this.viewName = 'New UI'; // for the UI
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

        body.append('<x-newui id="new-ui"></x-newui>');
        $('#oldChildren').empty();
      });
    }
  };
  window.Cockpit.UIs.push(new Ui());
}(window, jQuery));