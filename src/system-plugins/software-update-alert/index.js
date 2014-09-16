var PREFERENCES = 'plugins:software-update';
function softwareUpdate(name, deps) {
  console.log('Software update plugin started.');
  var preferences = getPreferences(deps.config);
  showSerialScript = __dirname + '/scripts/' + (process.env.USE_MOCK === 'true' ? 'mock-' : '') + 'showserial.sh';


  deps.app.get('/system-plugin/software-update/config', function (req, res) {
    res.send(preferences);
  });

  deps.app.get('/system-plugin/software-update/config/selectedBranches', function (req, res) {
    res.send(preferences['selectedBranches']);
  });

  deps.app.get('/system-plugin/software-update/config/showAlerts', function (req, res) {
    var showAlerts = preferences['showAlerts'];
    res.send(showAlerts ? showAlerts : true);
  });

  deps.app.post('/system-plugin/software-update/config/showAlerts', function (req, res) {
    preferences['showAlerts'] = req.body;
  });

  deps.app.post('/system-plugin/software-update/config/selectedBranches', function (req, res) {
    preferences['selectedBranches'] = req.body;
    res.status(200);
    res.send(preferences['selectedBranches']);
    deps.config.preferences.set(PREFERENCES, preferences);
    deps.config.savePreferences();
  });
}
function loadBoardSerial(script, callback) {
  var status = spawn('sh', [ script ]);
  status.stdout.on('data', function (data) {
    console.log('stderr: ' + data);
    var serial = data.toString();
    var parts = serial.split(':');
    if (parts.length > 0) {
      serial = parts[parts.length -1].trim();
    }
    callback(serial);
  });
  status.on('close', function (code) {
    if (code !== 0) {
      callback("ERROR");
    }
  });
};


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