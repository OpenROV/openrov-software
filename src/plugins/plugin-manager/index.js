var PREFERENCES = 'plugins:plugin-manager';

function pluginManager(name, deps) {
  console.log('Pugin Manager plugin started.');

  var preferences = getPreferences(deps.config);

  deps.app.get(
    '/plugin/plugin-manager/config',
    function(req, res) {
      res.send(preferences);
    });

  deps.app.get(
    '/plugin/plugin-manager/config/:pluginName',
    function(req, res) {
      res.send(preferences[req.params.pluginName]);
      console.log(' ### GET PLUGIN MANAGER: ' + req.params.pluginName + " : isEnabled: " + preferences[req.params.pluginName].isEnabled);
    });

  deps.app.post(
    '/plugin/plugin-manager/config/:pluginName',
    function(req, res) {
      preferences[req.params.pluginName] = req.body;
      res.status(200);
      res.send();
      console.log(' ### POST PLUGIN MANAGER: ' + req.params.pluginName + " : isEnabled: " + req.body.isEnabled);
    }
  )
}

function getPreferences(config) {
  var preferences =  config.preferences.get(PREFERENCES);
  if (preferences == undefined) {
    config.preferences.set(PREFERENCES, {touchcontroller: {isEnabled: false}});
  }
  preferences = config.preferences.get(PREFERENCES);
  console.log('Plugin Manager preferences: ' + JSON.stringify(preferences));
  return preferences;
}
module.exports = pluginManager;