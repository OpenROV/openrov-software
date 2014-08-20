var spawn = require('child_process').spawn;

var PREFERENCES = 'plugins:serialnumber';
function config(deps) {
  var self = this;
  self.preferences = {};

  function getPreferences(config) {
    var preferences = config.preferences.get(PREFERENCES);
    if (preferences == undefined) {
      preferences = { rov: '123', board: 'N/A' };
      config.preferences.set(PREFERENCES, { rov: preferences.rov } );
    }
    console.log('Serialnumber settings loaded preferences: ' + JSON.stringify(preferences));
    return preferences;
  }

  self.register = function() {
    self.preferences = getPreferences(deps.config);

    deps.app.get('/plugin/serialnumber/config/', function (req, res) {
      res.send( self.preferences );
    });
    deps.app.get('/plugin/serialnumber/config/:property', function (req, res) {
      res.send(self.preferences[req.params.property]);
    });
    deps.app.post('/plugin/serialnumber/config/rov/:serial', function (req, res) {
      self.preferences.rov = req.params.serial;
      deps.config.preferences.set(PREFERENCES, { rov: self.preferences.rov } );
      deps.config.savePreferences();

      res.status(200);
      res.send();
    });
  };

  self.loadBoardSerial = function() {
    var status = spawn('sh', [ __dirname + '/tests/mock-bb-show-serial.sh']);
    status.stdout.on('data', function (data) {
      console.log('stderr: ' + data);
      var serial = data.toString();
      var parts = serial.split(':');
      if (parts.length > 0) {
        serial = parts[parts.length -1].trim();
      }
      self.preferences.board = serial;
    });
    status.on('close', function (code) {
      if (code !== 0) {
        self.preferences.board = "ERROR";
      }
    });
  };
}
module.exports = config;