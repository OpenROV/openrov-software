var PREFERENCES = 'plugins:software-update';
function softwareUpdate(name, deps) {
  console.log('Software update plugin started.');
  var preferences = getPreferences(deps.config);

  deps.app.get('/system-plugin/software-update/config', function (req, res) {
    res.send(preferences);
  });

  deps.app.get('/system-plugin/software-update/config/selectedBranches', function (req, res) {
    res.send(preferences['selectedBranches']);
  });
  deps.app.post('/system-plugin/software-update/config/selectedBranches', function (req, res) {
    preferences['selectedBranches'] = req.body;
    res.status(200);
    res.send(preferences['selectedBranches']);
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
  console.log('Software Update plugin loaded preferences: ' + JSON.stringify(preferences));
  return preferences;
}
module.exports = softwareUpdate;