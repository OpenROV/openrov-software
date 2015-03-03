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
      if ('mtrmod' in status){
        console.log('mtrmod: ' + status.mtrmod);
        navdata.mtrmod = status.mtrmod;
      }
    });

    deps.cockpit.on('plugin.navigationData.zeroDepth', function () {
      deps.rov.send('dzer()');
    });
    deps.cockpit.on('plugin.navigationData.calibrateCompass', function () {
      deps.rov.send('ccal()');
    });

    setInterval(function () {
      deps.cockpit.emit('plugin.navigationData.data', navdata);
    }, 100);

  }
  module.exports = Laser;
})();