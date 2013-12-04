(function (window, $, undefined) {
    'use strict';

    var Cockpit;

    Cockpit = function(dashboard) {

        var viewModel = new ProcessModel(); 
    	viewModel.requestStatus = function() { dashboard.socket.emit('status-cockpit'); };
    	viewModel.start = function() { dashboard.socket.emit('start-cockpit'); };
    	viewModel.stop = function() { dashboard.socket.emit('stop-cockpit') };
    
        dashboard.viewModel.cockpit = viewModel;

        dashboard.socket.on('status-cockpit', function(status) {
        	viewModel.status(status);
   	        viewModel.running((status === "Running"));
        });

        // Add required UI elements
        $("#main-row").append('<div id="cockpit"></div>');
        $("#cockpit").load(
        	'plugin/01_cockpit/plugin.html',
            function() { ko.applyBindings(dashboard.viewModel); }
            );

        console.log("Loaded Cockpit plugin.");
    };
    window.Dashboard.plugins.push(Cockpit);

}(window, jQuery));