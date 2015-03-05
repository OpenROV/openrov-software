(function() {

  var PREFERENCES = 'plugins:ui-selector';

  var UiSelectorLoader = function(name, deps) {
    return new UiSelector(name, deps);
  };

  var UiSelector = function(name, deps) {
    var self = this;
    console.log('loading Ui Selector plugin');
    this.config = deps.config;
    this.preferences = this.getPreferences();

    // GET config
    deps.app.get('/plugin/ui-selector', function (req, res) {
      res.send(self.preferences);
    });

    deps.app.post('/plugin/ui-selector/selectedUi/:uiName', function (req, res) {
      self.preferences.selectedUi = req.params.uiName;
      res.status(200);
      res.send();

      self.savePreferences();
    });
  };

  UiSelector.prototype.savePreferences = function() {
    this.config.preferences.set(PREFERENCES, this.preferences);
    this.config.savePreferences();
  };

  UiSelector.prototype.getPreferences = function() {
    var preferences = this.config.preferences.get(PREFERENCES);
    if (preferences === undefined) {
      preferences = {
        selectedUi: 'standard-ui'
      };
      this.config.preferences.set(PREFERENCES, preferences);
    }
    console.log('Ui Selector loaded preferences: ' + JSON.stringify(preferences));
    return preferences;
  };



  module.exports = UiSelectorLoader;

})();