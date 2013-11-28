var express = require('express')
  , app = express()
  , server = app.listen(3199)
  , io = require('socket.io').listen(server)
  , EventEmitter = require('events').EventEmitter

console.log(__dirname);

app.use(express.static(__dirname));
app.use('/mockJS', express.static(__dirname + '/mockJS'));
app.use('/js', express.static(__dirname + '/../js'));
app.use('/img', express.static(__dirname + '/../img'));
app.use('/css', express.static(__dirname + '/../css'));
app.use('/themes', express.static(__dirname + '/../themes'));

// no debug messages
//io.configure(function(){ io.set('log level', 1); });

var cockpit = {
	status : 'Unknown'
};

io.sockets.on('connection', function (socket) {
	console.log('connected');

	socket.on('status-cockpit', function(){
		emitCockpitStatus();
	});

	socket.on('start-cockpit', function(){
		cockpit.status = 'Running';
		emitCockpitStatus();
	});

	socket.on('stop-cockpit', function(){
		cockpit.status = 'Stoped'
		emitCockpitStatus();
	});

	function emitCockpitStatus() {
		socket.emit('status-cockpit', cockpit.status);
		process.send({ key: 'status-cockpit', value: cockpit.status});
	};

});

console.log('Started listening on port: ' + 3199);

