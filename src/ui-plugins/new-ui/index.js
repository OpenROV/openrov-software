function newUi(name, deps) {
  console.log('New UI plugin loaded.');

  deps.app.get('/new-ui/telemetry', function(req, res) {
    res.render('../ui-plugins/new-ui/public/popup.ejs',
      {
        title: 'Telemetry',
        uiElement: 'telemetry-monitor',
        webComponent: '/webcomponents/telemetry.html'
      });
  });

  deps.app.get('/new-ui/serial-monitor', function(req, res) {
    res.render('../ui-plugins/new-ui/public/popup.ejs',
      {
        title: 'Serial Monitor',
        uiElement: 'serial-monitor',
        webComponent: '/webcomponents/serial-monitor.html'
      });
  });
}
module.exports = newUi;