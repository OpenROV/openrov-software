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
      console.log('performing search for plugins');
      bower.commands
      .search('plugin',{})//.search('openrov-plugin-'+ name, {})
      .on('end', function (results) {
          console.log('sending plugins list to browser');
          client.emit('pluginfindersearchresults',results);
      });
    });

    socket.on('plugin-finder.install', function (name) {
      var originaldir = process.cwd();
      process.chdir('/usr/share/cockpit');
      console.log('New directory: ' + process.cwd());
      bower.commands
      .install([name], { save: false}, { cwd: '/usr/share/cockpit' })
      .on('error', function(err){
          console.log(err);
      })
      .on('log', function(info){
          console.log(info);
      })
      .on('end', function(installed){
        console.log('done processing plugin install');
        client.emit('pluginfinderinstallresults',installed);
        process.chdir(originaldir);
        console.log(installed);
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
module.exports = pluginFinder;
