function example(name, deps) {
  console.log('This is where plugin code would execute in the node process.');

  deps.cockpit.on('plugin.example.foo', function() {
    deps.cockpit.emit('plugin.example.message', 'bar');
  });
}
module.exports = example;