/*jshint esnext:true */
const PREFERENCES = 'plugins:capestatus';

function msToTime(s) {
  function addZ(n) {
    return (n < 10 ? '0' : '') + n;
  }
  var ms = s % 1000;
  s = (s - ms) / 1000;
  var secs = s % 60;
  s = (s - secs) / 60;
  var mins = s % 60;
  var hrs = (s - mins) / 60;
  return addZ(hrs) + ':' + addZ(mins) + ':' + addZ(secs);  // + '.' + ms;
}

function capestatus(name, deps) {
  console.log('Capestatus plugin started.');
  var preferences = getPreferences(deps.config);

  deps.rov.on('status', function(data) {
    handleStatus(deps.cockpit, data);
  });
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
      res.send('Supplied battery object does not follow specification: ' +
        JSON.stringify(new Battery('', 0, 0)));
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
      var demo = new Battery('', 0, 0);
      res.send('Supplied battery object does not follow specification: \'' + demo + '\'');
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
  
  function handleStatus(cockpit, data) {
    if ('time' in data) {
      var formattedRuntime = msToTime(data.time);
      cockpit.emit('plugin.capestatus.time.runtime', { raw: data.time, formatted: formattedRuntime});
    }

    if ('vout' in data) {
      cockpit.emit(
        'plugin.capestatus.battery.voltage',
        data.vout.toFixed(1));
    }

    if ('iout' in data) {
      cockpit.emit(
        'plugin.capestatus.battery.current.out',
        data.iout.toFixed(3));
    }

    if ('BT1I' in data) {
      cockpit.emit(
        'plugin.capestatus.battery.current.battery1',
        parseFloat(data.BT1I));
    }
    if ('BT2I' in data) {
      cockpit.emit(
        'plugin.capestatus.battery.current.battery2',
        parseFloat(data.BT2I));
    }
    if ('SC1I' in data) {
      cockpit.emit(
        'plugin.capestatus.battery.current.esc1',
        parseFloat(data.SC1I));
    }
    if ('SC2I' in data) {
      cockpit.emit(
        'plugin.capestatus.battery.current.esc2',
        parseFloat(data.SC2I));
    }
    if ('SC3I' in data) {
      cockpit.emit(
        'plugin.capestatus.battery.current.esc3',
        parseFloat(data.SC3I));
    }

    if ('cpuUsage' in data) {
      cockpit.emit(
        'plugin.capestatus.cpu',
        (data.cpuUsage * 100).toFixed(0));
    }
  }

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
