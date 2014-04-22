/*
 *
 * Description:
 * Configuration file.  Manage frame rate, port, etc.
 *
 */
var nconf = require('nconf');
var OpenROVCameraPath = './lib/OpenROVCamera';
var OpenROVControllerPath = './lib/OpenROVController';
var FirmwareInstallerPath = './lib/FirmwareInstaller';
var HardwarePath = './lib/Hardware';
var argv = require('optimist').argv;
var getLibPath = function (lib) {
  var result = lib;
  if (process.env.USE_MOCK === 'true' || argv.mock != undefined) {
    result += '-mock';
  }
  return result;
};
// Will essentially rewrite the file when a change to the defaults are made if there is a parsing error.
try {
  nconf.use('file', { file: '/usr/local/etc/rovconfig.json' });
} catch (err) {
  console.log('Unable to load the configuration file, resetting to defaults');
  console.log(err);
}
//just odd enough to recognize as defaults
nconf.defaults({
  'deadzone_pos': 0.1,
  'deadzone_neg': -0.1,
  'smoothingIncriment': 4,
  'photoDirectory': '/var/www/openrov/photos',
  'water_type': 0,
  'thrust_modifier_port': 1,
  'thrust_modifier_vertical': -1,
  'thrust_modifier_starbord': 1,
  'thrust_modifier_nport': 2,
  'thrust_modifier_nvertical': -2,
  'thrust_modifier_nstarbord': 2
});
module.exports = {
  debug: process.env.NODE_DEBUG !== 'false',
  debug_commands: false,
  production: process.env.NODE_ENV || true,
  sample_freq: process.env.SAMPLE_FREQ && parseInt(process.env.SAMPLE_FREQ) || 20,
  dead_zone: process.env.DEAD_ZONE && parseInt(process.env.DEAD_ZONE) || 10,
  video_frame_rate: process.env.VIDEO_FRAME_RATE && parseInt(process.env.VIDEO_FRAME_RATE) || 10,
  video_resolution: process.env.VIDEO_RESOLUTION || 'SXGA',
  video_device: process.env.VIDEO_DEVICE || '/dev/video0',
  video_port: process.env.VIDEO_PORT || 8090,
  port: process.env.PORT || argv.port || 8080,
  serial: process.env.SERIAL || '/dev/ttyO1',
  serial_baud: process.env.SERIAL_BAUD || 115200,
  preferences: nconf,
  OpenROVCamera: getLibPath(OpenROVCameraPath),
  OpenROVController: OpenROVControllerPath,
  FirmwareInstaller: getLibPath(FirmwareInstallerPath),
  Hardware: getLibPath(HardwarePath)
};
console.log('config', module.exports);
