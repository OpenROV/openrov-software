(function (window, $, undefined) {
  'use strict';
  var Photocapture;
  Photocapture = function Photocapture(cockpit) {
    console.log('Loading Photocapture plugin in the browser.');
    // Instance variables
    this.cockpit = cockpit;
    this.snapshots = ko.observableArray([]);
    // Add required UI elements
    $('body').append('<div id="photos"></div>');
    cockpit.extensionPoints.menu.append('<li><a href="#" id="show-photos">Photos</a></li>');
    cockpit.extensionPoints.buttonPanel.append('<button id="capture-photo" class="btn">Capture</button>');
    cockpit.extensionPoints.keyboardInstructions.append('<p>press <i>c</i> to capture an image</p>');
    var self = this;
    var jsFileLocation = urlOfJsFile('photocapture.js');
    // the js folder path
    this.photos = $('body').parent().find('#photos');
    this.photos.load(jsFileLocation + '../photospanel.html', function () {
      // Register the various event handlers
      ko.applyBindings(self, self.photos[0]);
    });
  };
  //This pattern will hook events in the cockpit and pull them all back
  //so that the reference to this instance is available for further processing
  Photocapture.prototype.listen = function listen() {
    var photoc = this;
    photoc.cockpit.rov.on('plugin.photoCapture.photos.updated', function (data) {
      console.log('got new photos');
      photoc.snapshots(data);
    });
    photoc.cockpit.rov.on('plugin.photoCapture.photos.added', function (filename) {
      console.log('got new photos');
      photoc.snapshots().push(filename);
      photoc.snapshots.valueHasMutated();
    });
    cockpit.extensionPoints.buttonPanel.find('#capture-photo').click(function () {
      photoc.cockpit.rov.emit('plugin.photoCapture.snapshot');
      console.log('send snapshot request to server');
    });

    photoc.cockpit.extensionPoints.inputController.register(
      {
        name: "photoCapture.takeSnapshot",
        description: "Take a snapshot of the current video image.",
        defaults: { keyboard: 'c', gamepad: 'LB' },
        down: function() { photoc.cockpit.rov.emit('plugin.photoCapture.snapshot'); }
      });

    cockpit.extensionPoints.menu.find('#show-photos').click(function () {
      photoc.photos.find('drop-in-dialog')[0].open();
      photoc.cockpit.sendUpdateEnabled = false;
    });

  };
  window.Cockpit.plugins.push(Photocapture);
}(window, jQuery));