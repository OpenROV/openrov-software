
(function(window, document) {
        
    var hostname = document.location.hostname ? document.location.hostname : "localhost";
    console.log("here");
    var Cockpit = function Cockpit(csocket) {
        this.socket = csocket;
        this.loadPlugins();
        console.log("loaded plugins");
    };

    Cockpit.prototype.loadPlugins = function loadPlugins() {
        var cockpit = this;
        Cockpit.plugins.forEach(function(plugin) {
            new plugin(cockpit);
        });
        Cockpit.plugins = []; //flush them out for now. May move to a loaded array if we use in the future
    };

    Cockpit.prototype.addPlugin = function addPlugin(plugin) {
        var cockpit = this;
        Cockpit.plugins.push(plugin);
        new plugin(cockpit);
    };
    
    // Static array containing all plugins to load
    Cockpit.plugins = [];

    window.Cockpit = Cockpit;
}(window, document));