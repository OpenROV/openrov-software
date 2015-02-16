(function() {
  function Laser(name, deps) {
    console.log('Laser plugin loaded');
    var claserstate = 0;

    deps.io.sockets.on('connection', function (socket) {
      // Cockpit
      socket.on('plugin.laser.toggle', function () {
        sendLaser();
      });

      // Arduino
      deps.rov.on('status', function (data) {
        if ('claser' in data) {
          var enabled = data.claser == 255;
          socket.emit('plugin.laser.' + (enabled ? 'enabled' : 'disabled'));
        }
      });
    });

    var sendLaser = function () {
      if (claserstate === 0) {
        claserstate = 255;
      } else {
        claserstate = 0;
      }
      deps.rov.writeCommand('claser(' + claserstate + ');');
    };

  }
  module.exports = Laser;
})();