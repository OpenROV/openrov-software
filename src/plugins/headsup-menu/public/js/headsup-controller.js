(function (window, $, undefined) {
  'use strict';
  var HeadsUpMenuController = function HeadsUpMenuController() {
    var self = this;
    self.items = ko.observableArray();

    self.register = function(label, callback) {
      self.items.push({ label: label, callback: callback});
    }

    self.trigger = function(item) {
      item.callback();
    }
  }
  window.Cockpit.headsUpMenu = new HeadsUpMenuController();
}(window, jQuery));