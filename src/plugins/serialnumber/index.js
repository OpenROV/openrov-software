var API = require('./api');
function serialnumber(name, deps) {
  console.log('Serialnumber plugin loaded.');
  var api = new API(deps);
  api.register();
  api.loadBoardSerial();
}
module.exports = serialnumber;