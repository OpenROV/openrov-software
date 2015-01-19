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
        $('#oldChildren').hide();

        body.append('<div id="UI" class=""><x-newui></x-newui></div>');
      });

      //$('#UI').load(jsFileLocation + '../new-ui.html', function () {
      //
      //  window.OpenROVPluginNewUI = {};
      //  window.OpenROVPluginNewUI.ready = function() {
      //
      //  };
      //
      //  $('#software-update-alert-container').appendTo('#newui-body');
      //
      //  $('head').append('<link rel="import" href="/plugin/new-ui/time.html" />');
      //  $('head').append('<link rel="import" href="/plugin/new-ui/compass.html" />');
      //  $('head').append('<link rel="import" href="/plugin/new-ui/video.html" />');
      //
      //  //somehow the width of the controlpad is not determind at first
      //  setTimeout(function() {
      //
      //  }, 500);
      //  $('#compass').hide();
      //
      //  $('#newui-depth').load(jsFileLocation + '../depth.html', function () {
      //    window.OpenRovPluginNewUIDepth.format({indicatorActive: 'white', indicatorInactive: 'black'});
      //    window.OpenRovPluginNewUIDepth.setDepth(3.71);
      //  });
      //  $('#newui-switches').load(jsFileLocation + '../switches.html', function () {
      //  });
      //
      //});
    }
  };
  window.Cockpit.plugins.push(Ui);
}(window, jQuery));