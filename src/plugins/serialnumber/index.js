var Config = require('./config');
function serialnumber(name, deps) {
  console.log('Serialnumber plugin loaded.');
  var config = new Config(deps);
  config.register();
  config.loadBoardSerial();
}
module.exports = serialnumber;