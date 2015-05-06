#!/usr/bin/env node
console._log = console.log;
console.log = function() {};
var CONFIG = require('../src/lib/config');
console.log = console._log;
var path = require('path');
var PREFERENCES = 'plugins:plugin-manager';

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

function getPreferences(config) {
  var preferences = config.preferences.get(PREFERENCES);
  if (preferences === undefined) {
    preferences = {};
    config.preferences.set(PREFERENCES, preferences);
  }
  return preferences;
}

var plugin = process.argv[2];

var pref = getPreferences(CONFIG);
if (plugin in pref) {
  process.exit(pref[plugin].isEnabled.toString().toBool() ? 0 : 1);
}
process.exit(1);
