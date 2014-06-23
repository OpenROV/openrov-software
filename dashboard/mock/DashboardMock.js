var express = require('express'), app = express(), server = app.listen(3199), io = require('socket.io').listen(server), EventEmitter = require('events').EventEmitter;
console.log(__dirname);
app.use(express.static(__dirname));
app.use('/mockJS', express.static(__dirname + '/mockJS'));
app.use('/js', express.static(__dirname + '/../src/static/js'));
app.use('/img', express.static(__dirname + '/../src/static/img'));
app.use('/css', express.static(__dirname + '/../src/static/css'));
app.use('/themes', express.static(__dirname + '/../src/static/themes'));
// no debug messages
//io.configure(function(){ io.set('log level', 1); });
io.sockets.on('connection', function (socket) {
  var cockpit = {
      status: 'Unknown',
      start: function () {
        cockpit.status = 'Running';
        emitCockpitStatus();
      },
      stop: function () {
        cockpit.status = 'Stopped';
        emitCockpitStatus();
      }
    };
  var cloud9 = {
      status: 'Unknown',
      start: function () {
        cloud9.status = 'Running';
        emitCloud9Status();
      },
      stop: function () {
        cloud9.status = 'Stopped';
        emitCloud9Status();
      }
    };
  var samba = {
      status: 'Unknown',
      start: function () {
        samba.status = 'Running';
        emitSambaStatus();
      },
      stop: function () {
        samba.status = 'Stopped';
        emitSambaStatus();
      }
    };
  process.on('message', function (message) {
    if (message.key === 'start-cockpit') {
      cockpit.start();
    }
    if (message.key === 'stop-cockpit') {
      cockpit.stop();
    }
    if (message.key === 'status-cockpit') {
      emitCockpitStatus();
    }
    if (message.key === 'start-cloud9') {
      cloud9.start();
    }
    if (message.key === 'stop-cloud9') {
      cloud9.stop();
    }
    if (message.key === 'status-cloud9') {
      emitCloud9Status();
    }
    if (message.key === 'start-samba') {
      samba.start();
    }
    if (message.key === 'stop-samba') {
      samba.stop();
    }
    if (message.key === 'status-samba') {
      emitSambaStatus();
    }
  });
  socket.on('status-cockpit', function () {
    emitCockpitStatus();
  });
  socket.on('start-cockpit', cockpit.start);
  socket.on('stop-cockpit', cockpit.stop);
  socket.on('status-cloud9', function () {
    emitCloud9Status();
  });
  socket.on('start-cloud9', cloud9.start);
  socket.on('stop-cloud9', cloud9.stop);
  socket.on('status-samba', function () {
    emitSambaStatus();
  });
  socket.on('start-samba', samba.start);
  socket.on('stop-samba', samba.stop);
  function emitCockpitStatus() {
    socket.emit('status-cockpit', cockpit.status);
    process.send({
      key: 'status-cockpit',
      value: cockpit.status
    });
  }
  function emitCloud9Status() {
    socket.emit('status-cloud9', cloud9.status);
    process.send({
      key: 'status-cloud9',
      value: cloud9.status
    });
  }
  function emitSambaStatus() {
    socket.emit('status-samba', samba.status);
    process.send({
      key: 'status-samba',
      value: samba.status
    });
  }
});
console.log('Started listening on port: ' + 3199);
