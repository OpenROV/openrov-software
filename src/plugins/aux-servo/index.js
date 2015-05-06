var Settings = require('./settings');

function auxServo(name, deps) {
  console.log('Auxiliary servo plugin.');
  var settings = new Settings(deps);
  settings.register();

  var configureServo = function(servo){
    deps.rov.send('xsrv.cfg(' + servo.pin + ',' + servo.min + ',' + servo.max + ')');
    settings.saveServoConfig(servo);
  };

  var execute = function(command){
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