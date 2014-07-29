function elevoncontrol(name, deps) {
  console.log('This is where elevon plugin code would execute in the node process.');

  deps.io.sockets.on('connection', function (socket) {

    //Inidividual motor diagnostic functions. Since these are dependent on the
    //configuration of the ROV they are in this plugin
    socket.on('port', function (x) {
      deps.rov.send('port(' + x * 100+ ')');
      console.log('port(' + x * 100+ ')');
    });
    socket.on('starboard', function (x) {
      deps.rov.send('starboard(' + x * 100+ ')');
      console.log('starboard(' + x * 100+ ')');
    });
    socket.on('setFlightControlsTo', function (x) {
      deps.rov.send('port(' + x * 100+ ')');
      console.log('port(' + x * 100+ ')');
    });
  }

}
module.exports = example;
