(function (window, $, undefined) {
  'use strict';

  var Ui = function StandardUI() {
    var jsFileLocation = urlOfJsFile('standard.js');

    this.name = 'standard-ui';   // for the settings
    this.viewName = 'Standard UI'; // for the UI

    this.polymerTemplateFile = jsFileLocation + '../standard-ui.html';
    this.template = "<rov-ui-standard></rov-ui-standard>";

    this.loaded = function() {

    };
    this.disable = function () {
      alert('new ui disabled');
    };

    function loadNewUi(rootElement) {


    }
  };
  window.Cockpit.UIs.push(new Ui());
}(window, jQuery));