function example(name, deps) {
  console.log('This is where plugin code would execute in the node process.');

  deps.io.on('connection', function(socket) {
    socket.on('plugin.example.foo', function() {
      socket.emit('plugin.example.message', 'bar');
    });
  });
}
module.exports = example;