var forever = require('forever-monitor');
var child = new forever.Monitor('/opt/openrov/dashboard/src/dashboard.js', {
    max: 3,
    silent: process.env.NODE_DEBUG === 'false',
    options: [],
    'logFile': '/var/log/openrov.dashboard.log',
    'outFile': '/var/log/openrov.dashboard.log',
    'errFile': '/var/log/openrov.dashboard.err.log'
  });
child.on('exit', function () {
  console.log('dashboard.js has exited after 3 restarts');
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