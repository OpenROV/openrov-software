(function (window, $, undefined) {
    'use strict';

    var Telemetry;

    Telemetry = function Telemetry(cockpit) {
        console.log("Loading Telemetry plugin in the browser.");

        // Instance variables
        this.cockpit = cockpit;

        // Add required UI elements
	$("#notfound").after(
                '<div id="telemetry" class="controller well well-small" > \
\
		    <ul data-bind="foreach: rawTelemetry">\
		       <li>\
		           <span data-bind="text: key"></span>\
		           <span data-bind="text: value"></span>\
		       </li>\
		    </ul>\
\
		</div>');
	
        // Register the various event handlers
        this.listen();
        
    };
    
    //This pattern will hook events in the cockpit and pull them all back
    //so that the reference to this instance is available for further processing
    Motor_diags.prototype.listen = function listen() {
        var self = this;
        $("#diagnostic .back-button").click(function (){
            self.SaveSettings();
        });
        this.cockpit.socket.on('settings', function(data) {
            self.LoadSettings(data);
        });

    };


    window.Cockpit.plugins.push(Telemetry);

}(window, jQuery));
