function example(name, deps) {
  console.log('This is where DiveProfile plugin code would execute in the node process.');

  deps.cockpit.on('plugin.diveprofile.watertype.toggle', function () {
    deps.rov.send('dtwa()');
  });
}
module.exports = example;