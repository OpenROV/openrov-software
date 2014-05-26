function googletalk_ipregistraion(name, deps) {
  console.log('This is where googletalk_ipregistraion code would execute in the node process.');
  // --move to utility file --
  var getNetworkIPs = function () {
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
            ip = matches[i].replace(filterRE, '$1');
            if (!ignoreRE.test(ip)) {
              cached.push(ip);
            }
          }
          //}
          callback(error, cached);
        });
      };
    }();
  //
  var jid = deps.config.preferences.get('googletalk_rovid');
  var password = deps.config.preferences.get('googletalk_rovpassword');
  var pilot = deps.config.preferences.get('googletalk_rov_pilotid');
  if (jid && password) {
    // Establish a connection
    var conn = new xmpp.Client({
        jid: jid,
        password: password,
        host: 'talk.google.com',
        port: 5222
      });
    conn.on('online', function () {
      if (pilot) {
        console.log('ONLINE');
        getNetworkIPs(function (error, ip) {
          conn.send(new xmpp.Element('message', {
            to: pilot,
            type: 'chat'
          }).c('body').t('ROV is online @ ' + ip));
          conn.end();
          if (error) {
            console.log('error:', error);
          }
        }, false);
      }
    });
    conn.on('error', function (e) {
      console.log(e);
    });
  }
}
module.exports = googletalk_ipregistraion;