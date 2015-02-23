function example(name, deps) {
  console.log('This is where plugin code would execute in the node process.');

  deps.cockpit.on('plugin.example.foo', function() {
    deps.cockpit.emit('plugin.example.message', 'bar');
  });

  deps.rov.registerPassthrough({
    messagePrefix: 'plugin.example',
    fromROV: [
      'example_foo',
      'example_bar'
    ],
    toROV: [
      'example_to_foo',
      'example_to_bar'
    ]
  });
}
module.exports = example;