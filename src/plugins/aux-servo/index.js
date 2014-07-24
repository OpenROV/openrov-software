function auxServo(name, deps) {
  console.log('Auxiliary servo plugin.');

  var configureServo = function(servo){
    deps.rov.send('xsrv.cfg(' + servo.pin + ',' + servo.min + ',' + servo.midPoint + ',' + servo.max + ',' + servo.stepWidth + ')');
  };

  var execute = function(command){
    deps.rov.send('xsrv.exe(' + command.pin + ',' + command.value + ')');
  };

  deps.rov.on('status', function(status){
    if ('xsrv.ext' in status) {
      deps.io.sockets.emit('auxservo-executed', status['xsrv.ext']);
      delete status['xsrv.ext'];
    }
  });

  deps.io.sockets.on('connection', function (socket) {

    socket.on('auxservo-config', function (config) {
      console.log('auxservo-config');
      configureServo(config);
    });

    socket.on('auxservo-execute', function (command) {
      console.log('auxservo-execute');
      execute(command);
    });

  });
}
module.exports = auxServo;