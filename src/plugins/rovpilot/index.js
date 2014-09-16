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
      //depricated
      deps.rov.send('thro(' + x * 100 + ')');
      console.log('thro(' + x * 100+ ')');
    });
    socket.on('throttle', function (x) {
      deps.rov.send('thro(' + x * 100 + ')');
      console.log('thro(' + x * 100+ ')');
    });
    socket.on('yaw', function (x) {
      deps.rov.send('yaw(' + x * 100+ ')');
      console.log('yaw(' + x * 100+ ')');
    });
    socket.on('lift', function (x) {
      deps.rov.send('lift(' + x * 100+ ')');
      console.log('lift(' + x * 100+ ')');
    });
    socket.on('pitch', function (x) {
      deps.rov.send('pitch(' + x * 100+ ')');
      console.log('pitch(' + x * 100+ ')');
    });
    socket.on('roll', function (x) {
      deps.rov.send('roll(' + x * 100+ ')');
      console.log('roll(' + x * 100+ ')');
    });

    socket.on('motor_test', function (controls) {
      deps.rov.sendMotorTest(controls.port, controls.starbord, controls.vertical);
    });
    socket.on('control_update', function (controls) {
      deps.rov.sendCommand(controls.throttle, controls.yaw, controls.lift);
    });
  });
}
module.exports = rovpilot;  //escp
