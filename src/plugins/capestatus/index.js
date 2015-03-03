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
  
  function handleStatus(cockpit, data) {
    if ('time' in data) {
      var formattedRuntime = msToTime(data.time);
      cockpit.emit('capestatus.time.runtime', { raw: data.time, formatted: formattedRuntime});
    }

    if ('vout' in data) {
      var value = data.vout.toFixed(1);
      cockpit.emit('capestatus.battery.voltage', value);
    }

    if ('iout' in data) {
      var value = data.iout.toFixed(3);
      cockpit.emit('capestatus.battery.current.out', value);
    }

    if ('BT1I' in data) {
      var value = parseFloat(data['BT1I']);
      cockpit.emit('capestatus.battery.current.battery1', value);
    }
    if ('BT2I' in data) {
      var value = parseFloat(data['BT2I']);
      cockpit.emit('capestatus.battery.current.battery2', value);
    }
    if ('SC1I' in data) {
      var value = parseFloat(data['SC1I']);
      cockpit.emit('capestatus.battery.current.esc1', value);
    }
    if ('SC2I' in data) {
      var value = parseFloat(data['SC2I']);
      cockpit.emit('capestatus.battery.current.esc2', value);
    }
    if ('SC3I' in data) {
      var value = parseFloat(data['SC3I']);
      cockpit.emit('capestatus.battery.current.esc3', value);
    }

    if ('cpuUsage' in data) {
      var value = (data.cpuUsage * 100).toFixed(0);
      cockpit.emit('capestatus.cpu', value);
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
