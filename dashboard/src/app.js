var express = require('express')
  , app = express()
  , server = app.listen(process.env.PORT)
  , io = require('socket.io').listen(server)
  , EventEmitter = require('events').EventEmitter;

app.use(express.static(__dirname + '/static/'));

var cp = require('child_process');
var dashboardEngine = cp.fork(__dirname + '/static/mock/DashboardMock.js');

var cockpit = {
	status : 'Unknown',
}

// no debug messages
io.configure(function(){ io.set('log level', 1); });

io.sockets.on('connection', function (socket) {

	socket.on('status-cockpit', function(){
		dashboardEngine.send('status-cockpit');
	});
	
	dashboardEngine.on('message', function(message){
		if (message.key != undefined) {
			socket.emit(message.key, message.value);
		}});

});

console.log('Started listening on port: ' + process.env.PORT);

