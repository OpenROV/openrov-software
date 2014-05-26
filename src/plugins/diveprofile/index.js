function example(name, deps) {
  console.log('This is where DiveProfile plugin code would execute in the node process.');
  deps.io.sockets.on('connection', function (socket) {
    socket.on('depth_togglewatertype', function () {
      deps.rov.send('dtwa()');
    });
  });
}
module.exports = example;