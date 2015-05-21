function telemetry(name, deps) {
  console.log('This is where Telemetry code would execute in the node process.');

  var statusdata = {};

  deps.rov.on('status', function(data){
    for (var i in data) {
      statusdata[i] = data[i];
    }
  });


  setInterval(function () {
    deps.cockpit.emit('plugin.telemetry.logData', statusdata);
  }, 1000);



}
module.exports = telemetry;
