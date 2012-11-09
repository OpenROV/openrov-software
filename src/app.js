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
  , EventEmitter = require('events').EventEmitter
  , OpenROVCamera = require(CONFIG.OpenROVCamera)
  , OpenROVController = require(CONFIG.OpenROVController)
  , OpenROVArduinoFirmwareController = require('./lib/OpenROVArduinoFirmwareController')  
  , StatusReader = require('./lib/StatusReader')
  , logger = require('./lib/logger').create(CONFIG.debug)
  ;

app.use(express.static(__dirname + '/static/'));

process.env.NODE_ENV = true;

var globalEventLoop = new EventEmitter();
var DELAY = Math.round(1000 / CONFIG.video_frame_rate);
var camera = new OpenROVCamera({delay : DELAY});
var controller = new OpenROVController(globalEventLoop);
var statusReader = new StatusReader();
var arduinoUploadController = new OpenROVArduinoFirmwareController(globalEventLoop);

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

	statusReader.getStatus(function() {
		statusReader.on('status', function(data) {
			socket.volatile.emit('status', data);
		});
	});

  camera.on('started', function(){
    socket.emit('videoStarted');
    console.log("emitted 'videoStated'");
  });

  camera.capture(function(err) {
    if (err) {
      connections -= 1;
      camera.close();
      return console.error('couldn\'t initialize camera. got:', err);
      }
  });
  arduinoUploadController.initializeSocket(socket);
});


// SOCKET disconnection ==============================
io.sockets.on('disconnect', function(socket){
  connections -= 1;
  if(connections === 0) rov.close();
});

camera.on('error.device', function(err) {
  console.error('camera emitted an error:', err);
});

if (process.platform === 'linux') {
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
}

console.log('Started listening on port: ' + CONFIG.port);
