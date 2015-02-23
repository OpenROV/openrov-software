(function() {
  function Laser(name, deps) {
    console.log('Lights plugin loaded');
    var lights = 0;

    // Cockpit
    deps.cockpit.on('plugin.lights.toggle', function () {
      toggleLights();
    });

    deps.cockpit.on('plugin.lights.adjust', function (value) {
      adjustLights(value);
      console.log('$############' + value);
    });

    // Arduino
    deps.rov.on('status', function (data) {
      if ('LIGP' in data) {
        var level = 'level' + Math.ceil(data.LIGP * 10);
        deps.cockpit.emit('plugin.lights.level', level);
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

      var command = 'ligt(' + deps.physics.mapLight(value) + ')';
      deps.rov.send(command);

    };

  }
  module.exports = Laser;
})();