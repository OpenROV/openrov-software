(function (window, $, undefined) {
    'use strict';

    var Example;

    Example = function Example(cockpit) {
        console.log("Loading example plugin in the browser.");

        // Instance variables
        this.cockpit = cockpit;

        // Add required UI elements
        $("#menu").prepend('<div id="example" class="hidden">[example]</div>');
    };

    window.Cockpit.plugins.push(Example);

}(window, jQuery));
