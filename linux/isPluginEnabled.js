#!/usr/bin/env node
var path = require('path');
var fs = require('fs');
var PREFERENCES = 'plugins:plugin-manager';
var nconf = require('nconf');

if (fs.existsSync('/etc/rovconfig.json')) {
  nconf.use('file', { file: '/etc/rovconfig.json' });
}
else if (fs.existsSync(__dirname && '../etc/rovconfig.json')) {
  nconf.use('file', { file: __dirname && '../etc/rovconfig.json' });
}

String.prototype.toBool = function () {
  switch (this.toLowerCase()) {
    case 'false':
    case 'no':
    case '0':
    case '':
      return false;
    default:
      return true;
  }
};

var plugin = process.argv[2];

var pref = nconf.get(PREFERENCES);
if (plugin in pref) {
  process.exit(pref[plugin].isEnabled.toString().toBool() ? 0 : 1);
}
process.exit(1);
