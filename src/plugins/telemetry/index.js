function telemetry(name, deps) {
  console.log('This is where Telemetry code would execute in the node process.');

  deps.io.on('connection', function(socket){
    deps.rov.on('status', function(data){
      socket.emit('plugin.telemetry.logData', data);
    })
  });
}
module.exports = telemetry;