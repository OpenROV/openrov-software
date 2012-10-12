/*
 *
 * Description:
 * Configuration file.  Manage frame rate, port, etc.
 *
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
