/*
 * Created for OpenROV:  www.openrov.com
 * Author:  Bran Sorem (www.bransorem.com)
 * Date: 04/21/12
 *
 * Description:
 * This script is the Node.js server for OpenROV.  It creates a server and instantiates an OpenROV
 * and sets the interval to grab frames.  The interval is set with the DELAY variable which is in
 * milliseconds.
 *
 * License
 * This work is licensed under the Creative Commons Attribution-ShareAlike 3.0 Unported License.
 * To view a copy of this license, visit http://creativecommons.org/licenses/by-sa/3.0/ or send a
 * letter to Creative Commons, 444 Castro Street, Suite 900, Mountain View, California, 94041, USA.
 */

var express = require('express');

var app = express.createServer(express.static(__dirname + '/static'))
  , io = require('socket.io').listen(app)
  , fs = require('fs')
  , OpenROVCamera = require('./lib/OpenROVCamera')
  , OpenROVController = require('./lib/OpenROVController')
  ;

var CONFIG = require('./lib/config');

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
  connections++;
  camera.capture(function(err) {
    if (err) {
      connections--;
      camera.close();
      return console.error('couldn\'t initialize camera. got:', err);
    }
    socket.send('initialize');  // opens socket with client

    // when frame emits, send it
    camera.on('frame', function(img){
      socket.volatile.emit('frame', img);
    });

    socket.on('control_update', function(controls) {
      controller.sendCommand(controls.throttle, controls.yaw, controls.lift);
    });
  });
});


// SOCKET disconnection ==============================
io.sockets.on('disconnect', function(socket){
  connections--;
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
})

process.on('uncaughtException', function(err) {
  console.error('Uncaught Exception:', err);
  camera.close();
  // throw err;
  process.exit(1);
});

app.listen(CONFIG.port);