/*jshint esnext:true */
const PREFERENCES = 'plugins:capestatus';

function capestatus(name, deps) {
  console.log('Capestatus plugin started.');
  var preferences = getPreferences(deps.config);

  // ## routes

  // GET conif
  deps.app.get('/plugin/capestatus', function (req, res) {
    res.send(preferences);
  });

  // POST - add new battery
  deps.app.post('/plugin/capestatus/batteries', function (req, res) {
    var battery = req.body;

    if (battery.name === undefined || battery.minVoltage === undefined || battery.maxVoltage === undefined) {
      res.status(400);
      res.send("Supplied battery object does not follow specification: " +
        JSON.stringify(new Battery("", 0, 0)));
      return;
    }

    preferences.batteries.push(battery);
    res.status(201);
    res.send(preferences.batteries);

    saveConfig(deps.config);
  });

  // POST - add new battery
  deps.app.post('/plugin/capestatus/selectedBattery', function (req, res) {
    preferences.selectedBattery = req.body.name;
    res.status(200);
    res.send();

    saveConfig(deps.config);
  });

    // delete
  deps.app.delete('/plugin/capestatus/batteries', function (req, res) {
    var battery = req.body;

    if (battery.name === undefined || battery.minVoltage === undefined || battery.maxVoltage === undefined) {
      res.status(400);
      var demo = new Battery("", 0, 0);
      res.send("Supplied battery object does not follow specification: '" + demo + "'");
      return;
    }

    var existing = preferences.batteries.filter(function(bat) {
      return bat.name === battery.name &&
        parseFloat(bat.minVoltage) === parseFloat(battery.minVoltage) &&
        parseFloat(bat.maxVoltage) === parseFloat(battery.maxVoltage);
    });

    if (existing !== undefined && existing.length === 1) {
      preferences.batteries.splice(preferences.batteries.indexOf(existing[0]), 1);
      saveConfig(deps.config);

      res.status(202)
        .send(preferences.batteries);
    }
    else {
      res.status(410);
      res.send();
    }
  });

  function Battery(name, minVoltage, maxVoltage) {
    this.name = name;
    this.minVoltage = minVoltage;
    this.maxVoltage = maxVoltage;

    return this;
  }

  function saveConfig(config) {
    config.preferences.set(PREFERENCES, preferences);
    config.savePreferences();
  }

  function getPreferences(config) {
    var preferences = config.preferences.get(PREFERENCES);
    if (preferences === undefined) {
      preferences = {
        batteries: [
          new Battery('TrustFire', 8.0, 13.0),
          new Battery('LiFePO4', 7.0, 10.0)
        ],
        selectedBattery: 'LiFePO4'
      };
      config.preferences.set(PREFERENCES, preferences);
    }
    console.log('Capestatus loaded preferences: ' + JSON.stringify(preferences));
    return preferences;
  }

}
module.exports = capestatus;
