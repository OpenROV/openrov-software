var Settings = require('./settings');

function auxServo(name, deps) {
  console.log('Auxiliary servo plugin.');
  var settings = new Settings(deps);
  settings.register();
  var servos = {};

  var mapA = function(x, in_min, in_max, out_min, out_max) {
    return (x - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
  }

  var configureServo = function(servo){
    servos[servo.pin] = servo;
    deps.rov.send('xsrv.cfg(' + servo.name + ', ' + servo.pin + ',' + servo.min + ',' + servo.max + ')');
    settings.saveServoConfig(servo);
  };

  var execute = function(command){
    var servo = servos[command.pin];
    var value = mapA(command.value, servo.min, servo.max, 1000, 2000);
    deps.rov.send('xsrv.exe(' + command.pin + ',' + command.value + ')');
  };

  deps.rov.on('status', function(status){
    if ('xsrv.ext' in status) {
      deps.cockpit.emit('plugin.aux-servo.executed', status['xsrv.ext']);
      setTimeout(function() {delete status['xsrv.ext'];}, 1000);
    }
  });

  deps.cockpit.on('plugin.aux-servo.config', function (config) {
    console.log('plugin.aux-servo.config ' + config);
    configureServo(config);
  });

  deps.cockpit.on('plugin.aux-servo.execute', function (command) {
    console.log('plugin.aux-servo.execute ' + command);
    execute(command);
  });



}
module.exports = auxServo;