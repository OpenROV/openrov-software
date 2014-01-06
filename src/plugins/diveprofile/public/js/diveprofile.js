/*jshint multistr: true*/
/*jslint es5: true */

(function (window, document, undefined) {
    'use strict';

    var DiveProfile;
    
    DiveProfile = function (cockpit) {
        console.log("Adding Compass to Artificial Horizon.");

        // Instance variables
        this.cockpit = cockpit;

        // Add required UI elements
        $("#diagnostic H4:contains('Callibration')").append('<a href="#" class="btn" id="toggle_watertype">Water</a>');

        // Listen to navdata updates
        
	$('#toggle_watertype').click(function() {
           socket.emit('depth_togglewatertype');
        });        
    };
    window.Cockpit.plugins.push(DiveProfile);

}(window, document, undefined));
