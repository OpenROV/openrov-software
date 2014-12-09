var PREFERENCES = 'plugins:software-update';
function softwareUpdate(name, deps) {
  console.log('Software update plugin started.');
  var preferences = getPreferences(deps.config);
  showSerialScript = __dirname + '/scripts/' + (process.env.USE_MOCK === 'true' ? 'mock-' : '') + 'showserial.sh';

  deps.app.get('/system-plugin/software-update/config', function (req, res) {
    res.send(preferences);
  });

  deps.app.get('/system-plugin/software-update/config/dashboardUrl', function (req, res) {
    res.send({url: deps.config.dashboardURL});
  });

  deps.app.get('/system-plugin/software-update/config/showAlerts', function (req, res) {
    res.send(preferences['showAlerts']);
  });

  deps.app.post('/system-plugin/software-update/config/showAlerts', function (req, res) {
    preferences['showAlerts'] = req.body;
    deps.config.preferences.set(PREFERENCES, preferences);
    deps.config.savePreferences();
    res.status(200);
    res.send(preferences['showAlerts']);
  });
}

function getPreferences(config) {
  var preferences = config.preferences.get(PREFERENCES);
  if (preferences == undefined) {
    preferences = { showAlerts: { showAlerts: true}, selectedBranches: { branches: "stable"} };
    config.preferences.set(PREFERENCES, preferences);
  }
  console.log('Software Update plugin loaded preferences: ' + JSON.stringify(preferences));
  return preferences;
}
module.exports = softwareUpdate;
