/*
 *
 * Description:
 * This script is the Node.js server for OpenROV.  It creates a server and instantiates an OpenROV
 * and sets the interval to grab frames.  The interval is set with the DELAY variable which is in
 * milliseconds.
 *
 */
var CONFIG = require('./lib/config'), fs = require('fs'), express = require('express'), app = express(), server = require('http').createServer(app), io = require('socket.io').listen(server, {log:false, origins:'*:*'}), EventEmitter = require('events').EventEmitter, OpenROVCamera = require(CONFIG.OpenROVCamera), OpenROVController = require(CONFIG.OpenROVController), OpenROVArduinoFirmwareController = require('./lib/OpenROVArduinoFirmwareController'), logger = require('./lib/logger').create(CONFIG), mkdirp = require('mkdirp'), path = require('path');
var PluginLoader = require('./lib/PluginLoader');

app.configure(function () {
  app.use(express.static(__dirname + '/static/'));
  app.use(express.json());
  app.use(express.urlencoded());
  app.use('/photos', express.directory(CONFIG.preferences.get('photoDirectory')));
  app.use('/photos', express.static(CONFIG.preferences.get('photoDirectory')));
  app.set('port', CONFIG.port);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs', { pretty: true });
  app.use(express.favicon(__dirname + '/static/favicon.icon'));
  app.use(express.logger('dev'));
  app.use(app.router);
  app.use('/components', express.static(path.join(__dirname, 'bower_components')));
  app.use('/plugin_components', express.static('/usr/share/cockpit/bower_components'));
});
// Keep track of plugins js and css to load them in the view
var scripts = [], styles = [];
// setup required directories
mkdirp(CONFIG.preferences.get('photoDirectory'));
process.env.NODE_ENV = true;
var globalEventLoop = new EventEmitter();
var DELAY = Math.round(1000 / CONFIG.video_frame_rate);
var camera = new OpenROVCamera({ delay: DELAY });
var controller = new OpenROVController(globalEventLoop);
var arduinoUploadController = new OpenROVArduinoFirmwareController(globalEventLoop);
controller.camera = camera;
app.get('/config.js', function (req, res) {
  res.type('application/javascript');
  res.send('var CONFIG = ' + JSON.stringify(CONFIG));
});
app.get('/', function (req, res) {
  res.render('index', {
    title: 'OpenROV Cockpit',
    scripts: scripts,
    styles: styles
  });
});

//socket.io cross domain access
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  res.header("Access-Control-Allow-Methods", "PUT, GET, POST, DELETE, OPTIONS");
  next();
});

var connections = 0;
// SOCKET connection ==============================
io.sockets.on('connection', function (socket) {
  connections += 1;
  if (connections == 1)
    controller.start();
  socket.send('initialize');
  // opens socket with client
  if (camera.IsCapturing) {
    socket.emit('videoStarted');
    console.log('Send videoStarted to client 2');
  } else {
    console.log('Trying to restart mjpeg streamer');
    camera.capture();
    socket.emit('videoStarted');
  }
  socket.emit('settings', CONFIG.preferences.get());
  socket.on('ping', function (id) {
    socket.emit('pong', id);
  });

  socket.on('tilt_update', function (value) {
    controller.sendTilt(value);
  });
  socket.on('brightness_update', function (value) {
    controller.sendLight(value);
  });
  socket.on('laser_update', function (value) {
    controller.sendLaser(value);
  });
  socket.on('depth_zero', function () {
    controller.send('dzer()');
  });
  socket.on('compass_callibrate', function () {
    controller.send('ccal()');
  });
  socket.on('update_settings', function (value) {
    for (var property in value)
      if (value.hasOwnProperty(property))
        CONFIG.preferences.set(property, value[property]);

    CONFIG.savePreferences();
    controller.updateSetting();
    setTimeout(function () {
      controller.requestSettings();
    }, 1000);
  });
  socket.on('disconnect', function () {
    connections -= 1;
    console.log('disconnect detected');
    if (connections === 0)
      controller.stop();
  });
  controller.on('status', function (status) {
    socket.volatile.emit('status', status);
  });
  controller.on('navdata', function (navdata) {
    socket.volatile.emit('navdata', navdata);
  });
  controller.on('rovsys', function (data) {
    socket.emit('rovsys', data);
  });
  controller.on('Arduino-settings-reported', function (settings) {
    socket.emit('settings', settings);
    console.log('sending arduino settings to web client');
  });
  controller.on('settings-updated', function (settings) {
    socket.emit('settings', settings);
    console.log('sending settings to web client');
  });
  globalEventLoop.on('videoStarted', function () {
    socket.emit('videoStarted');
    console.log('sent videoStarted to client');
  });
  globalEventLoop.on('videoStopped', function () {
    socket.emit('videoStopped');
  });
  arduinoUploadController.initializeSocket(socket);
});
camera.on('started', function () {
  console.log('emitted \'videoStarted\'');
  globalEventLoop.emit('videoStarted');
});
camera.capture(function (err) {
  if (err) {
    connections -= 1;
    camera.close();
    return console.error('couldn\'t initialize camera. got:', err);
  }
});
camera.on('error.device', function (err) {
  console.log('camera emitted an error:', err);
  globalEventLoop.emit('videoStopped');
});
if (process.platform === 'linux') {
  process.on('SIGTERM', function () {
    console.error('got SIGTERM, shutting down...');
    camera.close();
    process.exit(0);
  });
  process.on('SIGINT', function () {
    console.error('got SIGINT, shutting down...');
    camera.close();
    process.exit(0);
  });
}
// Prepare dependency map for plugins
var deps = {
    server: server,
    app: app,
    io: io,
    rov: controller,
    config: CONFIG,
    globalEventLoop: globalEventLoop
  };
// Load the plugins
function addPluginAssets(result) {
  scripts = scripts.concat(result.scripts);
  styles = styles.concat(result.styles);
  result.assets.forEach(
    function(asset) {
      app.use(asset.path, express.static(asset.assets));
    });
}

var loader = new PluginLoader();
loader.loadPlugins(path.join(__dirname, 'system-plugins'), '/system-plugin', deps, addPluginAssets);
loader.loadPlugins(path.join(__dirname, 'plugins'), '/plugin', deps, addPluginAssets);
mkdirp.sync('/usr/share/cockpit/bower_components');
loader.loadPlugins('/usr/share/cockpit/bower_components', '/community-plugin', deps, addPluginAssets, function(file){return file.substring(0, 15) === "openrov-plugin-"});


controller.start();

// Start the web server
server.listen(app.get('port'), function () {
  console.log('Started listening on port: ' + app.get('port'));
});
