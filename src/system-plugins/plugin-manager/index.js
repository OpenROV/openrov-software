var PREFERENCES = 'plugins:plugin-manager';
function pluginManager(name, deps) {
  console.log('Pugin Manager plugin started.');
  var preferences = getPreferences(deps.config);
  deps.app.get('/system-plugin/plugin-manager/config', function (req, res) {
    res.send(preferences);
  });
  deps.app.get('/system-plugin/plugin-manager/config/:pluginName', function (req, res) {
    res.send(preferences[req.params.pluginName]);
  });
  deps.app.post('/system-plugin/plugin-manager/config/:pluginName', function (req, res) {
    console.log(typeof req.body.isEnabled);
    preferences[req.params.pluginName] = req.body;
    res.status(200);
    res.send(preferences[req.params.pluginName]);
    deps.config.preferences.set(PREFERENCES, preferences);
    deps.config.savePreferences();
  });
}
function getPreferences(config) {
  var preferences = config.preferences.get(PREFERENCES);
  if (preferences == undefined) {
    preferences = {};
    config.preferences.set(PREFERENCES, preferences);
  }
  console.log('Plugin Manager loaded preferences: ' + JSON.stringify(preferences));
  return preferences;
}
module.exports = pluginManager;