(function() {
  function Laser(name, deps) {
    console.log('Navigation Data plugin loaded');

    var navdata = {
      roll: 0,
      pitch: 0,
      yaw: 0,
      thrust: 0,
      depth: 0,
      heading: 0
    };

    deps.io.sockets.on('connection', function (socket) {

      // Arduino
      deps.rov.on('status', function (status) {
        if ('hdgd' in status) {
          navdata.heading = status.hdgd;
        }
        if ('deap' in status) {
          navdata.depth = status.deap;
        }
        if ('pitc' in status) {
          navdata.pitch = status.pitc;
        }
        if ('roll' in status) {
          navdata.roll = status.roll;
        }
        if ('yaw' in status) {
          navdata.yaw = status.yaw;
        }
        if ('fthr' in status) {
          navdata.thrust = status.fthr;
        }
      });

      socket.on('plugin.navigationData.zeroDepth', function () {
        deps.rov.send('dzer()');
      });
      socket.on('plugin.navigationData.calibrateCompass', function () {
        deps.rov.send('ccal()');
      });

      setInterval(function () {
        socket.emit('plugin.navigationData.data', navdata);
      }, 100);

    });
  }
  module.exports = Laser;
})();