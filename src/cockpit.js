/*
 *
 * Description:
 * This script is the Node.js server for OpenROV.  It creates a server and instantiates an OpenROV
 * and sets the interval to grab frames.  The interval is set with the DELAY variable which is in
 * milliseconds.
 *
 */

var CONFIG = require('./lib/config')
  , fs=require('fs')
  , express = require('express')
  , app = express()
  , server = app.listen(CONFIG.port)
  , io = require('socket.io').listen(server)
  , EventEmitter = require('events').EventEmitter
  , OpenROVCamera = require(CONFIG.OpenROVCamera)
  , OpenROVController = require(CONFIG.OpenROVController)
  , OpenROVArduinoFirmwareController = require('./lib/OpenROVArduinoFirmwareController')
  , logger = require('./lib/logger').create(CONFIG.debug)
  , mkdirp = require('mkdirp')
  , path = require('path')
  , xmpp = require('node-xmpp');
  ;

app.use(express.static(__dirname + '/static/'));
app.use('/photos',express.directory(CONFIG.preferences.get('photoDirectory')));
app.use('/photos',express.static(CONFIG.preferences.get('photoDirectory')));

// setup required directories
mkdirp(CONFIG.preferences.get('photoDirectory'));

process.env.NODE_ENV = true;

var globalEventLoop = new EventEmitter();
var DELAY = Math.round(1000 / CONFIG.video_frame_rate);
var camera = new OpenROVCamera({delay : DELAY});
var controller = new OpenROVController(globalEventLoop);
var arduinoUploadController = new OpenROVArduinoFirmwareController(globalEventLoop);

app.get('/config.js', function(req, res) {
  res.type('application/javascript');
  res.send('var CONFIG = ' + JSON.stringify(CONFIG));
});

// no debug messages
io.configure(function(){ io.set('log level', 1); });

var connections = 0;

// --move to utility file --
var getNetworkIPs = (function () {
    var ignoreRE = /^(127\.0\.0\.1|::1|fe80(:1)?::1(%.*)?)$/i;

    var exec = require('child_process').exec;
    var cached;
    var command;
    var filterRE;

    switch (process.platform) {
    case 'win32':
    //case 'win64': // TODO: test
        command = 'ipconfig';
        filterRE = /\bIPv[46][^:\r\n]+:\s*([^\s]+)/g;
        break;
    case 'darwin':
        command = 'ifconfig';
        filterRE = /\binet\s+([^\s]+)/g;
        // filterRE = /\binet6\s+([^\s]+)/g; // IPv6
        break;
    default:
        command = 'ifconfig';
        filterRE = /\binet\b[^:]+:\s*([^\s]+)/g;
        // filterRE = /\binet6[^:]+:\s*([^\s]+)/g; // IPv6
        break;
    }

    return function (callback, bypassCache) {
        if (cached && !bypassCache) {
            callback(null, cached);
            return;
        }
        // system call
        exec(command, function (error, stdout, sterr) {
            cached = [];
            var ip;
            var matches = stdout.match(filterRE) || [];
            //if (!error) {
            for (var i = 0; i < matches.length; i++) {
                ip = matches[i].replace(filterRE, '$1')
                if (!ignoreRE.test(ip)) {
                    cached.push(ip);
                }
            }
            //}
            callback(error, cached);
        });
    };
})();
//

var jid = CONFIG.preferences.get('googletalk_rovid');
var password = CONFIG.preferences.get('googletalk_rovpassword');
var pilot = CONFIG.preferences.get('googletalk_rov_pilotid');

if ((jid) && (password)){
// Establish a connection
var conn = new xmpp.Client({
    jid         : jid,
    password    : password,
    host        : 'talk.google.com',
    port        : 5222
});
conn.on('online', function(){
    if (pilot){
 
    console.log("ONLINE");
    
    getNetworkIPs(function (error, ip) {
    
      conn.send(new xmpp.Element('message',
                                                    { to: pilot,
                                                      type: 'chat'}).
                                   c('body').
                                   t('ROV is online @ ' + ip));
      conn.end();

      if (error) {
          console.log('error:', error);
      }
    }, false);


    }
    
});
conn.on('error', function(e) {
     console.log(e);
});
}

// SOCKET connection ==============================
io.sockets.on('connection', function (socket) {
  connections += 1;
  if (connections == 1) controller.start();
    
  socket.send('initialize');  // opens socket with client

  controller.updateSetting();
  setTimeout((function() {
    controller.requestSettings();
  }), 1000);
  controller.requestCapabilities();
 
  socket.emit('settings',CONFIG.preferences.get());
  socket.emit('videoStarted');


    socket.on('motor_test', function(controls) {
        controller.sendMotorTest(controls.port, controls.starbord, controls.vertical);
    });
    socket.on('control_update', function(controls) {
        controller.sendCommand(controls.throttle, controls.yaw, controls.lift);
    });

    socket.on('tilt_update', function(value) {
        controller.sendTilt(value);
    });

    socket.on('brightness_update', function(value) {
        controller.sendLight(value);
    });
    
        socket.on('laser_update', function(value) {
        controller.sendLaser(value);
    });
    
    socket.emitPhotos = function(){
          fs.readdir(CONFIG.preferences.get('photoDirectory'),function(err,files){
            if(err) throw err;
            var myfiles = [];
            files.forEach(function(file){
              myfiles.push('/photos/' + path.basename(file));
            });
            globalEventLoop.emit('photos-updated',myfiles); // trigger files_ready event
          });    
    };
    
    socket.emitPhotos();
  
    socket.on('snapshot', function() {
        camera.snapshot( function(filename) {
          console.log('Photo taken: '+ filename);
          // read all files from current directory
          socket.emitPhotos();        
        });
    });
    
    socket.on('update_settings', function(value){
      for(var property in value)
        if(value.hasOwnProperty(property))
          CONFIG.preferences.set(property,value[property]);
      CONFIG.preferences.save(function (err) {
        if (err) {
          console.error(err.message);
          return;
        }
        console.log('Configuration saved successfully.');
      });
      controller.updateSetting();
      setTimeout((function() {
        controller.requestSettings();
      }), 1000);
      
    });
    
    socket.on('disconnect', function(){
      connections -= 1;
      console.log('disconnect detected');
      if(connections === 0) controller.stop();
    });

    controller.on('status',function(status){
        socket.volatile.emit('status',status);
    })

    controller.on('navdata',function(navdata){
        socket.volatile.emit('navdata',navdata);
    })
    
    controller.on('rovsys', function(data){
        socket.emit('rovsys',data);
    })
    
    controller.on('Arduino-settings-reported',function(settings){
        socket.emit('settings',settings);
        console.log('sending arduino settings to web client');
    })
    
    controller.on('settings-updated',function(settings){
        socket.emit('settings',settings);
        console.log('sending settings to web client');
    })
    
    globalEventLoop.on('photos-updated',function(photos){
        socket.emit('photos-updated',photos);
        console.log('sending photos to web client');
    })    

  arduinoUploadController.initializeSocket(socket);



});

  camera.on('started', function(){
    console.log("emitted 'videoStated'");
  });

  camera.capture(function(err) {
    if (err) {
      connections -= 1;
      camera.close();
      return console.error('couldn\'t initialize camera. got:', err);
      }
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
