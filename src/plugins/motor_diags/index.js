function motor_diags(name, deps) {
  console.log('The motor_diags plugin.');

  deps.rov.on('status', function (status) {
    if ('mtrmod' in status) {
      console.log('mtrmod: ' + status.mtrmod);
      deps.cockpit.emit('plugin.motorDiag.configuration', status.mtrmod);
    }
  });

  deps.cockpit.on('callibrate_escs', function () {
    deps.rov.send('mcal()');
    console.log('mcal() sent');
  });

  deps.cockpit.on('plugin.motorDiag.motorTest', function(positions){
     deps.rov.sendMotorTest(positions.port, positions.starbord, positions.vertical);
    });

}
module.exports = motor_diags;