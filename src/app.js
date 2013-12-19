var forever = require('forever-monitor');

  var child = new (forever.Monitor)('/opt/openrov/src/cockpit.js', {
    max: 3,
    silent: process.env.NODE_DEBUG === 'false',
    options: [],
    //
    // Log files and associated logging options for this instance
    // Need up update these to pull from the arguments passed in
    'logFile': '/var/log/openrov.log', // Path to log output from forever process (when daemonized)
    'outFile': '/var/log/openrov.log', // Path to log output from child stdout
    'errFile': '/var/log/openrov.log'  // Path to log output from child stderr
  });

  child.on('exit', function () {
    console.log('cockpit.js has exited after 3 restarts');
  });

  if (process.platform === 'linux') {
    process.on('SIGTERM', function() {
      console.error('got SIGTERM, shutting down...');
      child.stop();
    });

    process.on('SIGINT', function() {
      console.error('got SIGINT, shutting down...');
      child.stop();
    });
  }


  child.start();

