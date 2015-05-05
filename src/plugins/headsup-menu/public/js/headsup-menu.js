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
    self.getTemplateName = function(item) { return 'menuRow-' + item.type; };

    cockpit.extensionPoints.headsUpMenu = self;

    // Add required UI elements
    cockpit.extensionPoints.videoContainer.append('<div id="headsup-menu-base"></div>');
    var headsUpMenu = cockpit.extensionPoints.videoContainer.find('#headsup-menu-base');
    headsUpMenu.hide();
    self.getTemplateName = function(item) { return "menuRow-" + item.type };

    self.filterItmesByName = function(name) {
      return self.items().filter(
        function(item) {
          if (item.name !== undefined && ko.utils.unwrapObservable(item.name) === name) {
            return item;
          }
        });
    };

    var menuItems = [];
    var currentSelected = -1;

    //this technique forces relative path to the js file instead of the excution directory
    var jsFileLocation = urlOfJsFile('headsup-menu.js');

    cockpit.extensionPoints.videoContainer.prepend('<style id="headsup-menu-style"></style>');
    var styles = cockpit.extensionPoints.videoContainer.find('#headsup-menu-style');
    styles.load(
      jsFileLocation + '../css/style.css',
      function() {

      });
    headsUpMenu.load(
      jsFileLocation + '../headsup.html',
      function() {

        headsUpMenu.find('#headsup-menu-templates').appendTo($('body'));
        ko.applyBindings(self, headsUpMenu[0]);

        headsUpMenu.find('.menuRow').hover(
          function(){ $(this).find('.btn').addClass('btn-primary'); },
          function(){ $(this).find('.btn').removeClass('btn-primary'); }
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

    var createHook = function(name) {
      return function () {
        var hookName = name;
        var currentId = $(menuItems[currentSelected]).attr('id');
        self.items()
          .forEach(function (item) {
            if (item.uniqueId == currentId) {
              if (item[hookName] !== undefined) {
                item[hookName]();
              }
            }
          });
      }
    };

    var enablePlugin = function() {
      self.cockpit.extensionPoints.inputController.register(
        {
          name: 'headsupMenu.show',
          description: 'Show the heads up menu.',
          defaults: { keyboard: 'e', gamepad: 'START' },
          down: function () {
            headsUpMenu.show();
          },
          up: executeMenuItem,
          secondary: [
            {
              name: 'headsupMenu.next',
              description: 'select the next element of the heads up menu',
              defaults: { keyboard: 'c', gamepad: 'DPAD_DOWN' },
              down: moveSelectionNext
            },
            {
              name: 'headsupMenu.prev',
              description: 'select the previous element of the heads up menu',
              defaults: { keyboard: 'd', gamepad: 'DPAD_UP' },
              down: moveSelectionPrev
            },
            {
              name: "headsupMenu.left",
              description: "Hook for additional functions for a menu entry.",
              defaults: { keyboard: 'r', gamepad: 'DPAD_LEFT' },
              down: function() {
                console.log('left down');
                createHook('left')();
              },
              up: function() {
                console.log('left up');
                createHook('leftUp')();
              }
            },
            {
              name: "headsupMenu.right",
              description: "Hook for additional functions for a menu entry.",
              defaults: { keyboard: 't', gamepad: 'DPAD_RIGHT' },
              down: createHook('right'),
              up: createHook('rightUp')
            }
          ]
        });
    };

    var disablePlugin = function() {
      self.cockpit.extensionPoints.inputController.unregister('headsupMenu.show');
    };

    // for plugin management:
    this.name = 'headsup-menu'; // for the settings
    this.viewName = 'Heads up menu'; // for the UI
    this.canBeDisabled = true;
    this.enable = function() { enablePlugin(); };
    this.disable = function() { disablePlugin(); };

    enablePlugin();
  };

  HeadsUpMenu.prototype.register = function (item) {
    var self = this;
    var items = [].concat(item); // item can be a single object or an array
    items.forEach(function (anItem) {
      anItem.uniqueId = generateUUID();
      anItem._enableObservableDummy = ko.observable(); // if the enabled property is not observable we can force the enabledItems updated via this
      if (anItem.type === undefined) {
        anItem.type = 'button';
      }
      if (anItem.type == 'custom') {
        anItem.headsUpTemplateId = 'custom-' + anItem.uniqueId;
        $('body').append('<script type="text/html" id="' + anItem.headsUpTemplateId + '">' + anItem.content + '</script>');
      }
      self.items.push(anItem);
    });
  };

  HeadsUpMenu.prototype.enable = function(name) {
    var self = this;
    self.filterItmesByName(name).forEach(function(item) {
        if (ko.isObservable(item.enabled)) { item.enabled(true); }
        else {
          item.enabled = true;
          item._enableObservableDummy(Date.now());
        }
      });
    };

  HeadsUpMenu.prototype.disable = function(name) {
    var self = this;
    self.filterItmesByName(name).forEach(function(item) {
        if (ko.isObservable(item.enabled)) { item.enabled(false); }
        else {
          item.enabled = false;
          item._enableObservableDummy(Date.now());
        }
      });
  };

  function generateUUID(){
    var d = Date.now();
    var uuid = '4xxx-yxxx'.replace(/[xy]/g, function(c) {
      var r = (d + Math.random()*16)%16 | 0;
      d = Math.floor(d/16);
      return (c=='x' ? r : (r&0x7|0x8)).toString(16);
    });
    return uuid;
  }

  window.Cockpit.plugins.push(HeadsUpMenu);
}(window, jQuery));
