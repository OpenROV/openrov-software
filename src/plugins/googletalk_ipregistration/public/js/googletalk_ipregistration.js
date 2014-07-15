(function (window, $, undefined) {
  'use strict';
  var Googletalk_ipregistraion;
  Googletalk_ipregistraion = function Googletalk_ipregistraion(cockpit) {
    console.log('Loading Googletalk_ipregistration plugin in the browser.');
    // Instance variables
    this.cockpit = cockpit;
    // Add required UI elements

    //this technique forces relative path to the js file instead of the execution directory
    var jsFileLocation = urlOfJsFile('googletalk_ipregistration.js');

    $('#settings')
      .find('#plugin-settings')
      .append('<div id="gtalk-settings"></div>');
    $('#gtalk-settings').load(jsFileLocation + '../settings.html');
  };
  //This pattern will hook events in the cockpit and pull them all back
  //so that the reference to this instance is available for further processing
  Googletalk_ipregistraion.prototype.listen = function listen() {
    var googletalk = this;
    $('#settings').find('.back-button').click(function () {
      googletalk.SaveSettings();
    });
    this.cockpit.socket.on('settings', function (data) {
      googletalk.LoadSettings(data);
    });
  };
  Googletalk_ipregistraion.prototype.LoadSettings = function LoadSettings(config) {
    if ('googletalk_rovid' in settings)
      $('#googleTalkROVid').val(config.googletalk_rovid);
    if ('googletalk_rovpassword' in settings)
      $('#googleTalkROVpassword').val(config.googletalk_rovpassword);
    if ('googletalk_rov_pilotid' in settings)
      $('#googleTalkPilotId').val(config.googletalk_rov_pilotid);
  };
  Googletalk_ipregistraion.prototype.SaveSettings = function SaveSettings() {
    this.cockpit.socket.emit('update_settings', { googletalk_rovid: $('#googleTalkROVid').val() });
    this.cockpit.socket.emit('update_settings', { googletalk_rovpassword: $('#googleTalkROVpassword').val() });
    this.cockpit.socket.emit('update_settings', { googletalk_rov_pilotid: $('#googleTalkPilotId').val() });
  };
  window.Cockpit.plugins.push(Googletalk_ipregistraion);
}(window, jQuery));
