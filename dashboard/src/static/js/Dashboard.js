(function (window, document) {
  var hostname = document.location.hostname ? document.location.hostname : 'localhost';
  var Dashboard = function Dashboard(csocket, viewModel) {
    this.socket = csocket;
    this.sendUpdateEnabled = true;
    this.viewModel = viewModel;
    this.loadPlugins();
    console.log('loaded plugins');
    // Register the various event handlers
    this.listen();
  };
  Dashboard.prototype.listen = function listen() {
    var dashboard = this;
  };
  Dashboard.prototype.loadPlugins = function loadPlugins() {
    var dashboard = this;
    Dashboard.plugins.forEach(function (plugin) {
      try {
        new plugin(dashboard);
      } catch (err) {
        console.log('error loading a plugin');
        console.log(err.message);
        throw err;
      }
    });
    Dashboard.plugins = [];  //flush them out for now. May move to a loaded array if we use in the future
  };
  Dashboard.prototype.addPlugin = function addPlugin(plugin) {
    var dashboard = this;
    Dashboard.plugins.push(plugin);
    new plugin(dashboard);
  };
  // Static array containing all plugins to load
  Dashboard.plugins = [];
  window.Dashboard = Dashboard;
}(window, document));