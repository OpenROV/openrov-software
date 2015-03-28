(function() {
  function ExternalLights(name, deps) {
    console.log('ExternalLights plugin loaded');
    var lights = 0;

    // Cockpit
    deps.cockpit.on('plugin.externalLights.toggle', function () {
      toggleLights();
    });

    deps.cockpit.on('plugin.externalLights.adjust', function (value) {
      adjustLights(value);
    });

    // Arduino
    deps.rov.on('status', function (data) {
      if ('LIGTE' in data) {
        //value of 0-1.0 representing percent
        var level = data.LIGP;
        lights = level;
        deps.cockpit.emit('plugin.externalLights.level', level);
      }
    });

    var adjustLights = function (value) {
      if (lights === 0 && value < 0) {
        //this code rounds the horn so to speak by jumping from zero to max and vise versa
        lights = 0;  //disabled the round the horn feature
      } else if (lights == 1 && value > 0) {
        lights = 1;  //disabled the round the horn feature
      } else {
        lights += value;
      }
      setLights(lights);
    };

    var toggleLights = function() {
      if (lights > 0) {
        setLights(0);
      } else {
        setLights(1);
      }
    };

    var setLights = function (value) {
      lights = value;
      if (lights > 1)
        lights = 1;
      if (lights < 0)
        lights = 0;

      var command = 'eligt(' + deps.ArduinoHelper.serial.packPercent(value) + ')';
      deps.rov.send(command);

    };

  }
  module.exports = ExternalLights;
})();
