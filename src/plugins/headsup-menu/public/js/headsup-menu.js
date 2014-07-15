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
        var items = [].concat(item); // item can be a single object or an array
        items.forEach(function (anItem) {
          anItem.uniqueId = generateUUID();
          if (anItem['type'] == undefined) {
            anItem.type = "button";
          }
          if (anItem['type'] == 'custom') {
            anItem.headsUpTemplateId = 'custom-' + anItem.uniqueId;
          }
          self.items.push(anItem);
        });
      });

    // Add required UI elements
    $('#video-container').append('<div id="headsup-menu-base"></div>');
    var headsUpMenu = $('#headsup-menu-base');
    headsUpMenu.hide();

    var menuItems = [];
    var currentSelected = -1;

    //this technique forces relative path to the js file instead of the excution directory
    var jsFileLocation = urlOfJsFile('headsup-menu.js');


    headsUpMenu.load(
      jsFileLocation + '../headsup.html',
      function() {

        ko.applyBindings(self, document.getElementById("headsup-menu-base"));

        $('.menuRow').hover(
          function(){ $(this).find('.btn').addClass('btn-primary') },
          function(){ $(this).find('.btn').removeClass('btn-primary') }
        );
        menuItems = headsUpMenu.find('.menuRow');
      });

    var executeMenuItem = function() {
      var currentId = $(menuItems[currentSelected]).attr('id');
      self.items()
        .forEach(function(item) {
          if (item.uniqueId == currentId) {
            item.callback();
          }
        });
      headsUpMenu.hide();
      menuItems.trigger('mouseout');
      currentSelected = -1;
    };

    var moveSelectionNext = function() {
      menuItems.trigger('mouseout');
      var nextIndex = currentSelected + 1;
      if (nextIndex >= menuItems.length) { nextIndex = -1; }
      var item = menuItems[nextIndex];
      $(item).trigger('mouseover');
      currentSelected = nextIndex;
    };

    var moveSelectionPrev = function() {
      menuItems.trigger('mouseout');
      var nextIndex = currentSelected - 1;
      if (nextIndex === -2 ) { nextIndex = menuItems.length -1; }
      var item = menuItems[nextIndex];
      $(item).trigger('mouseover');
      currentSelected = nextIndex;
    };

    var enablePlugin = function() {
      self.cockpit.emit('inputController.register',
        {
          name: "headsupMenu.show",
          description: "Show the heads up menu.",
          defaults: { keyboard: 'e', gamepad: 'START' },
          down: function () {
            $('#headsup-menu-base').show();
          },
          up: executeMenuItem,
          secondary: [
            {
              name: "headsupMenu.next",
              description: "select the next element of the heads up menu",
              defaults: { keyboard: 'c', gamepad: 'DPAD_DOWN' },
              down: moveSelectionNext
            },
            {
              name: "headsupMenu.prev",
              description: "select the previous element of the heads up menu",
              defaults: { keyboard: 'd', gamepad: 'DPAD_UP' },
              down: moveSelectionPrev
            }
          ]
        });
    };

    var disablePlugin = function() {
      self.cockpit.emit('inputController.unregister', "headsupMenu.show");
    };

    // for plugin management:
    this.name = "headsup-menu" // for the settings
    this.viewName = "Heads up menu"; // for the UI
    this.canBeDisabled = true;
    this.enable = function() { enablePlugin(); };
    this.disable = function() { disablePlugin(); };

    enablePlugin();
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
