(function(window) {
  'use strict';
  var plugins = namespace('plugins');
  plugins.NavigatoinData = function(cockpit) {
    var self = this;
    self.cockpit = cockpit;

    var jsFileLocation = urlOfJsFile('navigation-data.js');
    cockpit.extensionPoints.rovDiagnostics.find('#calibrations').append('<div id="navigation-diag"></div>');

    var diag = cockpit.extensionPoints.rovDiagnostics.find('#navigation-diag');
    diag.load(jsFileLocation + '../diagnostics.html', function () {
      cockpit.extensionPoints.rovDiagnostics.find('#zero_depth').click(function () {
        cockpit.rov.emit('plugin.navigationData.zeroDepth');
      });
      cockpit.extensionPoints.rovDiagnostics.find('#calibrate_compass').click(function () {
        cockpit.rov.emit('plugin.navigationData.calibrateCompass');
      });
    });
  };

  //This pattern will hook events in the cockpit and pull them all back
  //so that the reference to this instance is available for further processing
  plugins.NavigatoinData.prototype.listen = function listen() {
    var self = this;
    
  };

  window.Cockpit.plugins.push(plugins.NavigatoinData);

})(window);