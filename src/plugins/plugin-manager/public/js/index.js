(function (window, $, undefined) {
    'use strict';
    var PluginManager;
    PluginManager = function Example(cockpit) {
        console.log('Loading Plugin Manager plugin.');
        this.cockpit = cockpit;

        $('#settings #plugin-settings').append('<div id="plugin-manager-settings"></div>');
        $('#plugin-manager-settings').load('plugin/plugin-manager/settings.html', function () {});
    };
    window.Cockpit.plugins.push(PluginManager);
}(window, jQuery));