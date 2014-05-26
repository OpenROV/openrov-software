var EventEmitter = require('events').EventEmitter, cp = require('child_process');
function DashboardEngine() {
  var engine = new EventEmitter();
  var mock = cp.fork(__dirname + '/../../mock/DashboardMock.js');
  // redirecting messages to socket-ios
  mock.on('message', function (message) {
    engine.emit('message', message);
  });
  engine.on('signal', function (message) {
    mock.send({
      key: message.key,
      value: message.value
    });
  });
  return engine;
}
module.exports = DashboardEngine;