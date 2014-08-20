var spawn = require('child_process').spawn;

var PREFERENCES = 'plugins:serialnumber';
function api(deps) {
  var self = this;
  self.preferences = {};

  function getPreferences(config) {
    var preferences = config.preferences.get(PREFERENCES);
    if (preferences == undefined) {
      preferences = { rovserial: '123' };
      config.preferences.set(PREFERENCES, preferences);
    }
    console.log('Serialnumber settings loaded preferences: ' + JSON.stringify(preferences));
    return preferences;
  }

  self.register = function() {
    self.preferences = getPreferences(deps.config);

    deps.app.get('/plugin/serialnumber', function (req, res) {
      res.send(self.preferences);
    });
    deps.app.get('/plugin/serialnumber/:property', function (req, res) {
      res.send(self.preferences[req.params.property]);
    });
    deps.app.post('/plugin/serialnumber/rovserial/:serial', function (req, res) {
      self.preferences.rovserial = req.params.serial;
      deps.config.preferences.set(PREFERENCES, self.preferences);
      deps.config.savePreferences();

      res.status(200);
      res.send();
    });
  };

  self.loadBoardSerial = function() {
/*    status = spawn('sudo', [ '.sh']);
    status.stderr.on('data', function (data) {
      console.log('stderr: ' + data);
    });
    status.on('close', function (code) {
      if (code === 0) {
        engine.emit('message', {
          key: statusKey,
          value: 'Running'
        });
      } else if (code === 1) {
        engine.emit('message', {
          key: statusKey,
          value: 'Stopped'
        });
      } else {
        engine.emit('message', {
          key: statusKey,
          value: 'Unknow'
        });
      }
    });
*/
  };
}
module.exports = api;