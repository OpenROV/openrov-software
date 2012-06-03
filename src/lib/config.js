/*
 * Created for OpenROV:  www.openrov.com
 * Author:  Simon Murtha-Smith
 * Date: 06/03/12
 *
 * Description:
 * Configuration file.  Manage frame rate, port, etc.
 *
 * License
 * This work is licensed under the Creative Commons Attribution-ShareAlike 3.0 Unported License.
 * To view a copy of this license, visit http://creativecommons.org/licenses/by-sa/3.0/ or send a
 * letter to Creative Commons, 444 Castro Street, Suite 900, Mountain View, California, 94041, USA.
 */


module.exports = {
  debug:            process.env.NODE_DEBUG       !== 'false',
  sample_freq:     (process.env.SAMPLE_FREQ      && parseInt(process.env.SAMPLE_FREQ))     || 20, //Hz
  dead_zone:        process.env.DEAD_ZONE        && parseInt(process.env.DEAD_ZONE)        || 10,
  video_frame_rate: process.env.VIDEO_FRAME_RATE && parseInt(process.env.VIDEO_FRAME_RATE) || 15,
  production:       process.env.NODE_ENV         || false,
  port:             process.env.PORT             || 8080
};

console.log("config", module.exports);
