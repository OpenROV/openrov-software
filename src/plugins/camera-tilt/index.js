(function() {
  function Laser(name, deps) {
    console.log('Camera tilt plugin loaded');
    var tilt = 0;

    // Cockpit
    deps.cockpit.on('plugin.cameraTilt.set', function (angle) {
      setCameraTilt(angle);
    });

    deps.cockpit.on('plugin.cameraTilt.adjust', function (value) {
      adjustCameraTilt(value);
    });

    // Arduino
    deps.rov.on('status', function (data) {
      if ('servo' in data) {
        var angle = 90 / 500 * data.servo * -1 - 90;
        deps.cockpit.emit('plugin.cameraTilt.angle', angle);
      }
    });

    var setCameraTilt = function(value) {
      tilt = value;
      if (tilt > 1)
        tilt = 1;
      if (tilt < -1)
        tilt = -1;

      var servoTilt = deps.physics.mapTiltServo(tilt);
      var command = 'tilt(' + servoTilt + ')';

      deps.rov.send(command);
    };

    var adjustCameraTilt = function(value) {
      tilt += value;
      setCameraTilt(tilt);
    };
  }
  module.exports = Laser;
})();