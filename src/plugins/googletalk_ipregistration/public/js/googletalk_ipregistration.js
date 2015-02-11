(function (window, $, undefined) {
  'use strict';
  var Googletalk_ipregistraion;
  var settingsElement;
  Googletalk_ipregistraion = function Googletalk_ipregistraion(cockpit) {
    console.log('Loading Googletalk_ipregistration plugin in the browser.');
    // Instance variables
    this.cockpit = cockpit;
    // Add required UI elements

    //this technique forces relative path to the js file instead of the execution directory
    var jsFileLocation = urlOfJsFile('googletalk_ipregistration.js');

    this.cockpit.extensionPoints.settingsElement
      .append('<div id="gtalk-settings"></div>');
    settingsElement = this.cockpit.extensionPoints.settingsElement.find('#gtalk-settings');
    settingsElement.load(jsFileLocation + '../settings.html');
  };
  //This pattern will hook events in the cockpit and pull them all back
  //so that the reference to this instance is available for further processing
  Googletalk_ipregistraion.prototype.listen = function listen() {
    var googletalk = this;
    this.cockpit.extensionPoints.rovSettings.registerCloseHandler(function () {
      googletalk.SaveSettings();
    });
    this.cockpit.socket.on('settings', function (data) {
      googletalk.LoadSettings(data);
    });
  };
  Googletalk_ipregistraion.prototype.LoadSettings = function LoadSettings(config) {
    if ('googletalk_rovid' in config)
      settingsElement.find('#googleTalkROVid').val(config.googletalk_rovid);
    if ('googletalk_rovpassword' in config)
      settingsElement.find('#googleTalkROVpassword').val(config.googletalk_rovpassword);
    if ('googletalk_rov_pilotid' in config)
      settingsElement.find('#googleTalkPilotId').val(config.googletalk_rov_pilotid);
  };
  Googletalk_ipregistraion.prototype.SaveSettings = function SaveSettings() {
    this.cockpit.socket.emit('update_settings', { googletalk_rovid: settingsElement.find('#googleTalkROVid').val() });
    this.cockpit.socket.emit('update_settings', { googletalk_rovpassword: settingsElement.find('#googleTalkROVpassword').val() });
    this.cockpit.socket.emit('update_settings', { googletalk_rov_pilotid: settingsElement.find('#googleTalkPilotId').val() });
  };
  window.Cockpit.plugins.push(Googletalk_ipregistraion);
}(window, jQuery));
