(function() {
  function Laser(name, deps) {
    console.log('Laser plugin loaded');
    var claserstate = 0;

    // Cockpit
    deps.cockpit.on('plugin.laser.toggle', function () {
      sendLaser();
    });

    // Arduino
    deps.rov.on('status', function (data) {
      if ('claser' in data) {
        var enabled = data.claser == 255;
        deps.cockpit.emit('plugin.laser.' + (enabled ? 'enabled' : 'disabled'));
      }
    });

    var sendLaser = function () {
      if (claserstate === 0) {
        claserstate = 255;
      } else {
        claserstate = 0;
      }
      deps.rov.send('claser(' + claserstate + ')');
    };

  }
  module.exports = Laser;
})();