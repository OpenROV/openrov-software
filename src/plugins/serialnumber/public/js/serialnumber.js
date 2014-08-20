(function (window, $, undefined) {
  'use strict';

  var Serialnumber;
  Serialnumber = function Serialnumber(cockpit) {
    var self = this;

    console.log('Loading Serialnumber plugin.');

    // Instance variables
    this.cockpit = cockpit;
    // Add required UI elements
    $('#menu').prepend('<div id="example" class="hidden">[example]</div>');

    // for plugin management:
    this.name = 'serialnumber';   // for the settings
    this.viewName = 'Serialnumber plugin'; // for the UI
    this.canBeDisabled = false; //allow enable/disable
    this.enable = function () {
    };
    this.disable = function () {
    };

    this.model = {
      boardSerial: ko.observable("N/A"),
      rovSerial: ko.observable(""),
      originalTitle: ko.observable()
    };
    this.model.title = ko.computed(function() {
      return self.model.rovSerial() === "" ?
        self.model.originalTitle() :
        self.model.originalTitle() + " | #" + self.model.rovSerial()
    });

    $('#plugin-settings').append('<div id="serialnumber-settings"></div>');
    var jsFileLocation = urlOfJsFile('serialnumber.js');
    $('#serialnumber-settings').load(jsFileLocation + '../settings.html', function () {
      ko.applyBindings(self.model, document.getElementById('serialnumber-settings'));
    });

    var title = $('head title');
    self.model.originalTitle(title.text());
    title.attr({
      id: "serialnumber-titel",
      'data-bind': 'text: title'
    });
    ko.applyBindings(self.model, document.getElementById('serialnumber-titel'));
  };

  window.Cockpit.plugins.push(Serialnumber);
}(window, jQuery));