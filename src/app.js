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

var app = express.createServer(express.static('static'))
  , io = require('socket.io').listen(app)
  , fs = require('fs')
//  , serialPort = require('serialport').SerialPort
//  , serial = new serialPort('/dev/ttyACM0', { baud: 9600 })
//  , serial = new serialPort('/dev/ttyUSB0', { baud: 9600 })
  , OpenROV = require('./OpenROV.js');

// Serial controls Arduino.  TODO: cut out Arduino and use BeagleBone for PWM
// ACM0 - Uno
// USB0 - Duemillanove

// Globals =================
var mutex = 0;
var rov = new OpenROV();
var DELAY = 67;
var PORT = 8080;

// no debug messages
io.configure(function(){ io.set('log level', 1); });

// SOCKET connection ==============================
io.sockets.on('connection', function (socket) {
  socket.send('initialize');  // opens socket with client

//  socket.on('key', function(key){
//    serial.write(key);
//  });

  // when frame emits, send it
  rov.on('frame', function(img){
    socket.volatile.emit('frame', img);
  });

  // run one instance, but push frames to all clients
  if (mutex == 0){
    rov.init();
    rov.capture({'delay' : DELAY});
//    serial.write('1');
  }
  mutex++;
});

// SOCKET disconnection ==============================
io.sockets.on('disconnect', function(socket){
  mutex--;
  if (mutex == 0){
    rov.close();  // no need to keep running the process, no one is watching
  }
});


app.listen(PORT);