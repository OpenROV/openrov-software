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
      .list( {}, { cwd: '/usr/share/cockpit' })
      .on('end',function (listing) {
          var list = listing.dependencies;
          bower.commands
          .search('openrov-plugin-'+ name, {})
          .on('end', function (results) {
              for(var result in results){
                //console.log(list.keys());
                if(results[result].name in list){
                  results[result].InstalledOnROV = true;
                }
              }
              console.log('sending plugins list to browser');
              client.emit('pluginfindersearchresults',results);
          });
      });
    });

    socket.on('plugin-finder.list', function (name) {
      console.log('performing list for plugins');
      bower.commands
      .list( {}, { cwd: '/usr/share/cockpit' })
      .on('end',function (results) {
          console.log('sending plugins list to browser');
          client.emit('pluginfinderinstalled',results);
      });
    });

    socket.on('plugin-finder.install', function (name) {
      bower.commands
      .install([name], { save: false}, { cwd: '/usr/share/cockpit' })
      .on('error', function(err){
          console.log(err);
      })
      .on('log', function(info){
          console.log(info);
          client.emit('pluginfinderinstallstatus',info);
      })
      .on('end', function(installed){
        console.log('done processing plugin install');
        client.emit('pluginfinderinstallresults',installed);
        client.emit('pluginfinderrestartRequired');
        //There is a bug with bower, possibly around re-installing
        //that causes the CPU to max out forever. This restart
        //is as much a work-around as it is needed to load the
        //server-side aspects of the plugin.
        console.log("intentional restart");
      	setTimeout(process.exit(17),5000);
      });

    });

    socket.on('plugin-finder.uninstall', function (name) {
      bower.commands
      .uninstall([name], {}, { cwd: '/usr/share/cockpit' })
      .on('error', function(err){
          console.log(err);
      })
      .on('log', function(info){
          console.log(info);
          client.emit('pluginfinderuninstallstatus',info);
      })
      .on('end', function(uninstalled){
        console.log('done processing plugin uninstall');
        client.emit('pluginfinderuninstallresults',uninstalled);
        client.emit('pluginfinderrestartRequired');
        //There is a bug with bower, possibly around re-installing
        //that causes the CPU to max out forever. This restart
        //is as much a work-around as it is needed to load the
        //server-side aspects of the plugin.
        console.log("intentional restart");
        setTimeout(process.exit(17),5000);
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
