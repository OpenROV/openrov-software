module.exports = {
  debug: process.env.NODE_DEBUG === 'true',
  sample_freq: (process.env.SAMPLE_FREQ && parseInt(process.env.SAMPLE_FREQ)) || 10,
  dead_zone: process.env.DEAD_ZONE && parseInt(process.env.DEAD_ZONE) || 10,
  production: process.env.NODE_ENV || false
};

console.log("config", module.exports);