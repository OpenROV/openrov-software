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
      var body = $('body');
      var children = body.children();
      body.append('<div id="UI" class=""></div>');
      body.append('<div id="oldChildren"></div>');
      children.appendTo('#oldChildren');
      $('#oldChildren').hide();

      var jsFileLocation = urlOfJsFile('new-ui.js');

      $('#UI').load(jsFileLocation + '../new-ui.html', function () {

        $('#software-update-alert-container').appendTo('#newui-body');
        $('#video-container').appendTo('#newui-video');
        $('head').append('<link rel="import" href="/plugin/new-ui/time.html" />');

        //somehow the width of the controlpad is not determind at first
        setTimeout(function() {
          var innerWidth = $('#newui-controlpad').innerWidth();
          $('#newui-video').height($(window).innerHeight() - $('#newui-topbar').innerHeight() );
          $('#newui-video').width($(window).innerWidth() -  innerWidth);
        }, 500);
        $('#compass').hide();

        $('#newui-compass').load(jsFileLocation + '../compass.html', function () {
          window.OpenRovPluginNewUICompass.format({indicator: 'white'});
          window.OpenRovPluginNewUICompass.setHeading(200);
          window.OpenRovPluginNewUICompass.setBearing();
        });

        $('#newui-depth').load(jsFileLocation + '../depth.html', function () {
          window.OpenRovPluginNewUIDepth.format({indicatorActive: 'white', indicatorInactive: 'black'});
          window.OpenRovPluginNewUIDepth.setDepth(3.71);
        });
        $('#newui-switches').load(jsFileLocation + '../switches.html', function () {
        });

        //$('head').append('<link rel="import" href="' + jsFileLocation + '../time.html' +'">');
        //$('#newui-time').append('<newui-time></newui-time>')

      });
    }
  };
  window.Cockpit.plugins.push(Ui);
}(window, jQuery));