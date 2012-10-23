/*
 * Created for OpenROV:  www.openrov.com
 * Author:  Simon Murtha-Smith, Bran Sorem
 * Date: 06/03/12
 *
 * Description:
 * This file holds the controller logic.  It manages the connection to the Atmega328.
 * TODO: must manually enable UART.  Fix this.
 * >>$ echo 0 > /sys/kernel/debug/omap_mux/uart1_txd
 * >>$ echo 20 > /sys/kernel/debug/omap_mux/uart1_rxd
 * Note: RX not setup yet, needs to be added
 *
 * License
 * This work is licensed under the Creative Commons Attribution-ShareAlike 3.0 Unported License.
 * To view a copy of this license, visit http://creativecommons.org/licenses/by-sa/3.0/ or send a
 * letter to Creative Commons, 444 Castro Street, Suite 900, Mountain View, California, 94041, USA.
 */

var CONFIG = require('./config')
  , logger = require('./logger').create(CONFIG.debug);

var OFFSET = 128;

var OpenROVController = function() {
  
  var controller = {};
  controller.sendCommand = function(throttle, yaw, vertical) {
    var port = 0,
    starbord = 0;
    port = starbord = throttle;
    port += yaw;
    starbord -= yaw;
    port = map(port);
    starbord = map(starbord);
    vertical = Math.round(exp(vertical)) + 128;
    if (port < 30) port = 30;
    if (starbord < 30) starbord = 30;
    if (vertical < 30) vertical = 30;
    var command = 'go(' + port + ',' + vertical + ',' + starbord + ');';
    console.log("command", command);
  }

  return controller;
}

function map(val) {
  val = limit(val, -127, 127);
  val = Math.round(exp(val));
  val += OFFSET;
  return val;
}

function exp(val) {
  if(val === 0) return 0;
  var sign = val / Math.abs(val);
  var adj = Math.pow(127, Math.abs(val) / 127);
  return sign * adj;
}

function limit(value, l, h) { // truncate anything that goes outside of -127, 127
  return Math.max(l, Math.min(h, value));
}

module.exports = OpenROVController;
