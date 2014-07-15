var CONFIG = require('../../lib/config');
var logger = require('../../lib/logger').create(CONFIG);

var InputController = function() {
  'use strict';
  var self = this;
  logger.log('Loaded nodejs InputController component');
  return self;
};
module.exports = InputController;