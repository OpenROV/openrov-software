/*
 *
 * Description:
 * Configuration file.  Manage frame rate, port, etc.
 *
 */

var OpenROVCameraPath = "./lib/OpenROVCamera";
var OpenROVControllerPath = "./lib/OpenROVController";
var FirmwareInstallerPath = "./lib/FirmwareInstaller";

var getLibPath = function(lib) {
	var result = lib;
	if (process.env.USE_MOCK === 'true') {
		result += '-mock';
	}
	return result;
}

module.exports = {
  debug:            process.env.NODE_DEBUG      !== 'false',
  debug_commands:   process.env.NODE_DEBUG_COMMANDS     === 'true',
  production:       process.env.NODE_ENV         || true,
  sample_freq:     (process.env.SAMPLE_FREQ      && parseInt(process.env.SAMPLE_FREQ))     || 20, //Hz
  dead_zone:        process.env.DEAD_ZONE        && parseInt(process.env.DEAD_ZONE)        || 10,
  video_frame_rate: process.env.VIDEO_FRAME_RATE && parseInt(process.env.VIDEO_FRAME_RATE) || 15,
  video_resolution: process.env.VIDEO_RESOLUTION || 'SVGA',
  video_device:     process.env.VIDEO_DEVICE     || '/dev/video0',  
  video_port:       process.env.VIDEO_PORT       || 8090,  
  port:             process.env.PORT             || 8080,
  serial:           process.env.SERIAL           || '/dev/ttyO1',
  serial_baud:      process.env.SERIAL_BAUD      || '115200',
  OpenROVCamera:    getLibPath(OpenROVCameraPath),  
  OpenROVController:getLibPath(OpenROVControllerPath),  
  FirmwareInstaller:getLibPath(FirmwareInstallerPath),  
};

console.log("config", module.exports);
