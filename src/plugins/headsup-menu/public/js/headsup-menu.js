(function (window, $, undefined) {
  'use strict';
  var HeadsUpMenu;
  HeadsUpMenu = function HeadsUpMenu(cockpit) {
    console.log('Loading HeadsUpMenu plugin in the browser.');
    var self = this;

    self.cockpit = cockpit;
    self.items = ko.observableArray();
    self.getTemplateName = function(item) { return "menuRow-" + item.type };

    this.cockpit.on(
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
    $('#headsup-menu-base').hide();

    var menuItems = [];
    var currentSelected = -1;

    $('#headsup-menu-base').load(
      'plugin/headsup-menu/headsup.html',
      function() {

        ko.applyBindings(self, document.getElementById("headsup-menu-base"));

        $('.menuRow').hover(
          function(){ $(this).find('.btn').addClass('btn-primary') },
          function(){ $(this).find('.btn').removeClass('btn-primary') }
        );
        menuItems = $('#headsup-menu-base').find('.menuRow');
      });

    this.cockpit.emit('inputController.register',
      {
        name: "headsupMenu.show",
        description: "Show the heads up menu.",
        defaults: { keyboard: 'e', gamepad: 'LB' },
        down: function() { $('#headsup-menu-base').show(); },
        up: function() {
          $('#headsup-menu-base').hide();
          menuItems.trigger('mouseout');
          currentSelected = -1;
        },
        secondary: [
          {
            name: "headsupMenu.next",
            description: "select the next element of the heads up menu",
            defaults: { keyboard: 'd', gamepad: 'DPAD_DOWN' },
            down: function() {
              menuItems.trigger('mouseout');
              var nextIndex = currentSelected + 1;
              if (nextIndex >= menuItems.length) { nextIndex = -1; }
              var item = menuItems[nextIndex];
              $(item).trigger('mouseover');
              currentSelected = nextIndex;
            }
          }
        ]
      });

    //gamepad
/*    var gp ={
      up: GAMEPAD.DPAD_UP,
      down: GAMEPAD.DPAD_DOWN,
      showMenu: false
    };

    GAMEPAD.LB = {
      BUTTON_DOWN: function () {
        $('#headsup-menu-base').show();
        gp.showMenu = true;
      },
      BUTTON_UP: function () {
        $('#headsup-menu-base').hide();
        gp.showMenu = false;
      }
    };
    GAMEPAD.DPAD_UP = {
      BUTTON_DOWN: function () {
        if (gp.showMenu) {
          alert("up");
        }
        else { gp.up.BUTTON_DOWN(); }
      }
    };
    GAMEPAD.DPAD_DOWN = {
      BUTTON_DOWN: function () {
        if (gp.showMenu) {
          alert("down");
        }
        else { gp.down.BUTTON_DOWN(); }
      }
    };*/

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