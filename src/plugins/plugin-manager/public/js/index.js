(function (window, $, undefined) {
    'use strict';
    var PluginManager;
    PluginManager = function Example(cockpit) {
        console.log('Loading Plugin Manager plugin.');
        this.cockpit = cockpit;
        $('#menu').prepend('<div id="example" class="hidden">[example]</div>');
        $('#cockpit').load('plugin/01_cockpit/plugin.html', function () {
    };
    window.Cockpit.plugins.push(Example);
}(window, jQuery));