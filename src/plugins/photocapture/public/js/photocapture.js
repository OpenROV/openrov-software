(function (window, $, undefined) {
  'use strict';
  var Photocapture;
  Photocapture = function Photocapture(cockpit) {
    console.log('Loading Photocapture plugin in the browser.');
    // Instance variables
    this.cockpit = cockpit;
    this.snapshots = ko.observableArray([]);
    // Add required UI elements
    $('#diagnostic').after('<div id="photospanel"></div>');
    $('#menuitems').append('<li><a href="#" id="show-photos">Photos</a></li>');
    $('#buttonPanel').append('<button id="capture-photo" class="btn">Capture</button>');
    var self = this;
    $('#photospanel').load('../plugins/photocapture/public/photospanel.html', function () {
      // Register the various event handlers
      self.listen();
      ko.applyBindings(self, $('#photos')[0]);
    });
  };
  //This pattern will hook events in the cockpit and pull them all back
  //so that the reference to this instance is available for further processing
  Photocapture.prototype.listen = function listen() {
    var photoc = this;
    photoc.cockpit.socket.on('photos-updated', function (data) {
      console.log('got new photos');
      photoc.snapshots(data);
    });
    photoc.cockpit.socket.on('photo-added', function (filename) {
      console.log('got new photos');
      photoc.snapshots().push(filename);
      photoc.snapshots.valueHasMutated();
    });
    $('#capture-photo').click(function () {
      photoc.cockpit.socket.emit('snapshot');
      console.log('send snapshot request to server');
    });
    $('#show-photos').click(function () {
      $('#photos').show('fold');
      photoc.cockpit.sendUpdateEnabled = false;
      Mousetrap.bind('esc', photoc.hidePhotos);
    });
    $('#photos .back-button').click(function () {
      photoc.hidePhotos();
    });
  };
  Photocapture.prototype.hidePhotos = function hidePhoto() {
    $('#photos').hide('fold');
    this.cockpit.sendUpdateEnabled = true;
    Mousetrap.unbind('esc');
  };
  window.Cockpit.plugins.push(Photocapture);
}(window, jQuery));