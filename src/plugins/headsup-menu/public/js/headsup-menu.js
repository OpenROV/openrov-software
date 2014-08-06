(function (window, $, undefined) {
  'use strict';
  var HeadsUpMenu;
  HeadsUpMenu = function HeadsUpMenu(cockpit) {
    console.log('Loading HeadsUpMenu plugin in the browser.');
    var self = this;

    self.cockpit = cockpit;
    self.items = ko.observableArray();
    self.enabledItems = ko.computed(function() {
      return self.items().filter(function(item) {
        item._enableObservableDummy(); //to update on enable/disable
        return item.enabled === undefined || ko.utils.unwrapObservable(item.enabled); } );
    });
    self.getTemplateName = function(item) { return "menuRow-" + item.type };

    // Add required UI elements
    $('#video-container').append('<div id="headsup-menu-base"></div>');
    var headsUpMenu = $('#headsup-menu-base');
    headsUpMenu.hide();

    this.cockpit.on(
      'headsUpMenu.register',
      function (item) {
        var items = [].concat(item); // item can be a single object or an array
        items.forEach(function (anItem) {
          anItem.uniqueId = generateUUID();
          anItem._enableObservableDummy = ko.observable(); // if the enabled property is not observable we can force the enabledItems updated via this
          if (anItem['type'] == undefined) {
            anItem.type = "button";
          }
          if (anItem['type'] == 'custom') {
            anItem.headsUpTemplateId = 'custom-' + anItem.uniqueId;
            $('body').append('<script type="text/html" id="' + anItem.headsUpTemplateId + '">' + anItem.content + '</script>');
          }
          self.items.push(anItem);
        });
      });
    var filterItmesByName = function(name) {
      return self.items().filter(
        function(item) {
          if (item.name !== undefined && ko.utils.unwrapObservable(item.name) === name) {
            return item;
          }
        });
    };

    this.cockpit.on(
      'headsUpMenu.enable',
      function(name) {
        filterItmesByName(name).forEach(function(item) {
          if (ko.isObservable(item.enabled)) { item.enabled(true); }
          else {
            item.enabled = true;
            item._enableObservableDummy(Date.now());
          }
        });
      }
    );
    this.cockpit.on(
      'headsUpMenu.disable',
      function(name) {
        filterItmesByName(name).forEach(function(item) {
          if (ko.isObservable(item.enabled)) { item.enabled(false); }
          else {
            item.enabled = false;
            item._enableObservableDummy(Date.now());
          }
        });
      }
    );

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

    var leftHook = function() {
      var currentId = $(menuItems[currentSelected]).attr('id');
      self.items()
        .forEach(function(item) {
          if (item.uniqueId == currentId) {
            if (item.left !== undefined) {
              item.left();
            }
          }
        });
    };

    var rightHook = function() {
      var currentId = $(menuItems[currentSelected]).attr('id');
      self.items()
        .forEach(function(item) {
          if (item.uniqueId == currentId) {
            if (item.right !== undefined) {
              item.right();
            }
          }
        });
    };

    var enablePlugin = function() {
      self.cockpit.emit('inputController.register',
        {
          name: "headsupMenu.show",
          description: "Show the heads up menu.",
          defaults: { keyboard: 'alt', gamepad: 'START' },
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
            },
            {
              name: "headsupMenu.left",
              description: "Hook for additional functions for a menu entry.",
              defaults: { keyboard: 'r', gamepad: 'DPAD_LEFT' },
              down: leftHook
            },
            {
              name: "headsupMenu.right",
              description: "Hook for additional functions for a menu entry.",
              defaults: { keyboard: 't', gamepad: 'DPAD_RIGHT' },
              down: rightHook
            }
          ]
        });
    };

    var disablePlugin = function() {
      self.cockpit.emit('inputController.unregister', "headsupMenu.show");
    };

    // for plugin management:
    this.name = "headsup-menu"; // for the settings
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
