/* 
 * Created for OpenROV:  www.openrov.com
 * Author:  Bran Sorem (www.bransorem.com)
 * Date: 03/19/12
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
 
var app = require('http').createServer(handler)
  , io = require('socket.io').listen(app)
  , fs = require('fs')
  , OpenROV = require('./OpenROV.js');

// Globals =================
var mutex = 0;
var rov = new OpenROV();
var DELAY = 200;  // delay between frame grabs in milliseconds (roughly)
var PORT = 8080;

// no debug messages
io.configure(function(){ io.set('log level', 1); });

app.listen(PORT);

// HANDLER ==============================
function handler (req, res) {
  fs.readFile(__dirname + '/index.html',
  function (err, data) {
    if (err) {
      res.writeHead(500);
      return res.end('Error loading index.html');
    }
    res.writeHead(200);
    res.end(data);
  });
}

// SOCKET connection ==============================
io.sockets.on('connection', function (socket) {
  socket.send('initialize');  // opens socket with client

  // when frame emits, send it over socket
  rov.on('frame', function(img){
    socket.emit('frame', img);
  });

  // only run one instance
  if (mutex == 0){
    rov.init();
    rov.capture({'delay' : DELAY});
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
