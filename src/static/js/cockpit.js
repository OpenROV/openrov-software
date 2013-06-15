
(function(window, document) {
        
    var hostname = document.location.hostname ? document.location.hostname : "localhost";
    console.log("here");
    var Cockpit = function Cockpit() {
        this.loadPlugins();
        console.log("loaded plugins");
    };

    Cockpit.prototype.loadPlugins = function loadPlugins() {
        var cockpit = this;
        Cockpit.plugins.forEach(function(plugin) {
            new plugin(cockpit);
        });
    };

    // Static array containing all plugins to load
    Cockpit.plugins = [];

    window.Cockpit = Cockpit;
}(window, document));