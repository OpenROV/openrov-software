function motor_diags(name, deps) {
  console.log('This is where motor_diags code would execute in the node process.');
  deps.io.sockets.on('connection', function (socket) {
    socket.on('callibrate_escs', function () {
      deps.controller.send('mcal()');
      console.log('mcal() sent');
    });
  });
}
module.exports = motor_diags;