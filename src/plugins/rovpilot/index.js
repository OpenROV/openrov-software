function rovpilot(name, deps) {
  console.log('This is where rovpilot code would execute in the node process.');
  deps.io.sockets.on('connection', function (socket) {
    socket.on('escs_poweron', function () {
      deps.rov.send('escp(1)');
      console.log('escp(1) sent');
    });
    socket.on('escs_poweroff', function () {
      deps.rov.send('escp(0)');
      console.log('escp(0) sent');
    });
    socket.on('holdHeading_toggle', function () {
      deps.rov.send('holdHeading_toggle()');
      console.log('holdHeading_toggle() sent');
    });
    socket.on('holdDepth_toggle', function () {
      deps.rov.send('holdDepth_toggle()');
      console.log('holdDepth_toggle() sent');
    });
    socket.on('holdHeading_on', function (hdg) {
      deps.rov.send('holdHeading_toggle(' + hdg + ')');
      console.log('holdHeading_toggle(' + hdg + ')');
    });
    socket.on('holdDepth_on', function (dpt) {
      //manual cast to cm to avoid passing floats
      deps.rov.send('holdDepth_toggle(' + dpt * 100 + ')');
      console.log('holdDepth_toggle(' + dpt * 100 + ')');
    });
    socket.on('thro', function (x) {
      deps.rov.send('thro(' + x + ')');
      console.log('thro(' + x + ')');
    });
    socket.on('yaw', function (x) {
      deps.rov.send('yaw(' + x + ')');
      console.log('yaw(' + x + ')');
    });
    socket.on('lift', function (x) {
      deps.rov.send('lift(' + x + ')');
      console.log('lift(' + x + ')');
    });
  });
}
module.exports = rovpilot;  //escp
