function telemetry(name, deps) {
  console.log('This is where Telemetry code would execute in the node process.');

  deps.rov.on('status', function(data){
    deps.cockpit.emit('plugin.telemetry.logData', data);
  });
}
module.exports = telemetry;