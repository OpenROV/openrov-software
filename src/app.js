var forever = require('forever-monitor');
var child = new forever.Monitor('/opt/openrov/src/cockpit.js', {
    max: 3,
    silent: process.env.NODE_DEBUG === 'false',
    options: [],
    'logFile': '/var/log/openrov.log',
    'outFile': '/var/log/openrov.log',
    'errFile': '/var/log/openrov.log'
  });
child.on('exit', function () {
  console.log('cockpit.js has exited after 3 restarts');
});
if (process.platform === 'linux') {
  process.on('SIGTERM', function () {
    console.error('got SIGTERM, shutting down...');
    child.stop();
  });
  process.on('SIGINT', function () {
    console.error('got SIGINT, shutting down...');
    child.stop();
  });
}
child.start();