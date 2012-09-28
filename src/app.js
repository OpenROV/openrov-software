/*
 *
 * Description:
 * This script is the Node.js server for OpenROV.  It creates a server and instantiates an OpenROV
 * and sets the interval to grab frames.  The interval is set with the DELAY variable which is in
 * milliseconds.
 *
 */

var CONFIG = require('./lib/config')
  , express = require('express')
  , app = express()
  , server = app.listen(CONFIG.port)
  , io = require('socket.io').listen(server)
  , OpenROVCamera = require('./lib/OpenROVCamera')
  , OpenROVController = require('./lib/OpenROVController')
  ;

app.use(express.static(__dirname + '/static/'));

process.env.NODE_ENV = true;

var DELAY = Math.round(1000 / CONFIG.video_frame_rate);
var camera = new OpenROVCamera({delay : DELAY});
var controller = new OpenROVController();

app.get('/config.js', function(req, res) {
  res.send('var CONFIG = ' + JSON.stringify(CONFIG));
});

// no debug messages
io.configure(function(){ io.set('log level', 1); });

var connections = 0;

// SOCKET connection ==============================
io.sockets.on('connection', function (socket) {
  connections += 1;

  socket.send('initialize');  // opens socket with client

  socket.on('control_update', function(controls) {
    controller.sendCommand(controls.throttle, controls.yaw, controls.lift);
  });

  camera.capture(function(err) {
    if (err) {
      connections -= 1;
      camera.close();
      return console.error('couldn\'t initialize camera. got:', err);
    }

    console.log('initialized camera, adding listener for \'frame\' event');
    // when frame emits, send it
    camera.on('frame', function(img){
      // if (CONFIG.debug) console.log('emitting frame')
      socket.volatile.emit('frame', img);
    });
  });
});


// SOCKET disconnection ==============================
io.sockets.on('disconnect', function(socket){
  connections -= 1;
  if(connections === 0) rov.close();
});

camera.on('error.device', function(err) {
  console.error('camera emitted an error:', err);
});

process.on('SIGTERM', function() {
  console.error('got SIGTERM, shutting down...');
  camera.close();
  process.exit(0);
});

process.on('SIGINT', function() {
  console.error('got SIGINT, shutting down...');
  camera.close();
  process.exit(0);
});

console.log('Started listening on port: ' + CONFIG.port);
