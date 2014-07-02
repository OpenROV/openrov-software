(function (window, $, undefined) {
  'use strict';
  var HeadsUpMenu;
  HeadsUpMenu = function HeadsUpMenu(cockpit) {
    console.log('Loading HeadsUpMenu plugin in the browser.');
    var self = this;

    this.cockpit = cockpit;
    this.controller = new HeadsUpMenuController();

    // Add required UI elements
    $('#video-container').append('<div id="headsup-menu-base"></div>');
    cockpitEventEmitter.on(
      'headsUpMenu.register',
      function (item) {
        self.controller.register(item.description, item.callback);
      });

    $('#headsup-menu-base').load(
      'plugin/headsup-menu/headsup.html',
      function() {

        ko.applyBindings(self.controller, document.getElementById("headsup-menu-base"));

        $('.menuRow').find('.btn').hover(
          function(){ $(this).addClass('btn-primary') },
          function(){ $(this).removeClass('btn-primary') }
        );
      });

    // for plugin management:
    this.name = "headsup-menu" // for the settings
    this.viewName = "Heads up menu"; // for the UI
    this.canBeDisabled = true;
    this.enable = function() { /* to be done */ };
    this.disable = function() { /* to be done */ };
  };

  window.Cockpit.plugins.push(HeadsUpMenu);
}(window, jQuery));