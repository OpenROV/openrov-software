(function (window, $, undefined) {
  'use strict';
  var HeadsUpMenu;
  HeadsUpMenu = function HeadsUpMenu(cockpit) {
    console.log('Loading HeadsUpMenu plugin in the browser.');
    var self = this;

    self.cockpit = cockpit;
    self.items = ko.observableArray();

    cockpitEventEmitter.on(
      'headsUpMenu.register',
      function (item) {
        if (item['type'] == undefined) {
          item.type = "button";
        }
        if (item['type'] == 'custom') {
          item.headsUpUniqueId = 'custom-' + generateUUID();
        }
        self.items.push(item);
      });

    // Add required UI elements
    $('#video-container').append('<div id="headsup-menu-base"></div>');

    $('#headsup-menu-base').load(
      'plugin/headsup-menu/headsup.html',
      function() {

        ko.applyBindings(self, document.getElementById("headsup-menu-base"));

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

  function generateUUID(){
    var d = Date.now();
    var uuid = '4xxx-yxxx'.replace(/[xy]/g, function(c) {
      var r = (d + Math.random()*16)%16 | 0;
      d = Math.floor(d/16);
      return (c=='x' ? r : (r&0x7|0x8)).toString(16);
    });
    return uuid;
  };

  window.Cockpit.plugins.push(HeadsUpMenu);
}(window, jQuery));