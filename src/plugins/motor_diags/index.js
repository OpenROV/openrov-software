function motor_diags(name, deps) {
  console.log('This is where motor_diags code would execute in the node process.');

  deps.cockpit.on('callibrate_escs', function () {
    deps.rov.send('mcal()');
    console.log('mcal() sent');
  });

  deps.cockpit.on('plugin.motorDiag.motorTest', function(positions){
     deps.rov.sendMotorTest(positions.port, positions.starbord, positions.vertical);
    });

}
module.exports = motor_diags;