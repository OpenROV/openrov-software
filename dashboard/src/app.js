var express = require('express')
  , app = express()
  , server = app.listen(80)
  , io = require('socket.io').listen(server)
  , EventEmitter = require('events').EventEmitter;

app.use(express.static(__dirname + '/static/'));

// no debug messages
io.configure(function(){ io.set('log level', 1); });

io.sockets.on('connection', function (socket) {
});

console.log('Started listening on port: ' + 80);

