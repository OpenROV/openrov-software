(function (window, $, undefined) {
  'use strict';
  var serialnumberNs = namespace('pluginlugin.serialnumber');

  serialnumberNs.Serialnumber = function (cockpit) {
    var self = this;
    self.config = new serialnumberNs.Config();

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

    self.model = {
      boardSerial: ko.observable("N/A"),
      rovSerial: ko.observable(""),
      originalTitle: ko.observable(),
      isSaved: ko.observable(false)
    };
    self.model.title = ko.computed(function() {
      return self.model.rovSerial() === "" ?
        self.model.originalTitle() :
        self.model.originalTitle() + " | #" + self.model.rovSerial()
    });
    var serialsLoaded = false;
    self.config.getSerials(function(serials) {
      self.model.boardSerial(serials.board);
      self.model.rovSerial(serials.rov);
      serialsLoaded = true;
    });
    self.model.rovSerial.subscribe(
      function(newValue) {
        if (serialsLoaded) {
          self.config.setRovSerial(newValue, function () {
            self.model.isSaved(true);
            setTimeout(function () {
              self.model.isSaved(false);
            }, 1500);
          });
        }
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

  window.Cockpit.plugins.push(serialnumberNs.Serialnumber);
}(window, jQuery));