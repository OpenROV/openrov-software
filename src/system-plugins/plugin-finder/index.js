var bower = require('bower');
var PREFERENCES = 'plugins:plugin-finder';

function pluginFinder(name, deps) {
  console.log('Pugin Finder plugin loaded.');
  var preferences = getPreferences(deps.config);
  deps.app.get('/system-plugin/plugin-finder/config', function (req, res) {
    res.send(preferences);
  });
  deps.app.get('/system-plugin/plugin-finder/config/:pluginName', function (req, res) {
    res.send(preferences[req.params.pluginName]);
  });
  deps.app.post('/system-plugin/plugin-finder/config/:pluginName', function (req, res) {
    console.log(typeof req.body.isEnabled);
    preferences[req.params.pluginName] = req.body;
    res.status(200);
    res.send(preferences[req.params.pluginName]);
    deps.config.preferences.set(PREFERENCES, preferences);
    deps.config.savePreferences();
  });
  deps.io.sockets.on('connection', function (socket) {
    var client = socket;
    socket.on('plugin-finder.search', function (name) {
      bower.commands
      .search('plugin', {}) //.search('openrov-plugin-'+ name, {})
      .on('end', function (results) {
          client.emit('plugin-finder.search',results);
      });
    });

    socket.on('plugin-finder.install', function (name) {
      bower.commands
      .install([name], { save: true }, { allow-root: true })
      .on('end', function (installed) {
          client.emit('plugin-finder.install',installed);
      });
    });

  });
}


function getPreferences(config) {
  var preferences = config.preferences.get(PREFERENCES);
  if (preferences == undefined) {
    preferences = {};
    config.preferences.set(PREFERENCES, preferences);
  }
  console.log('Plugin Finder loaded preferences: ' + JSON.stringify(preferences));
  return preferences;
}
module.exports = pluginManager;
