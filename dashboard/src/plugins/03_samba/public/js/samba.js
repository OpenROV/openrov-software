(function (window, $, undefined) {
    'use strict';

    var Samba;

    Samba = function(dashboard) {

        var viewModel = new ProcessModel(); 
    	viewModel.requestStatus = function() { dashboard.socket.emit('status-samba'); };
    	viewModel.start = function() { dashboard.socket.emit('start-samba'); };
    	viewModel.stop = function() { dashboard.socket.emit('stop-samba') };
    
        dashboard.viewModel.samba = viewModel;

        dashboard.socket.on('status-samba', function(status) {
        	viewModel.status(status);
   	        viewModel.running((status === "Running"));
        });

        // Add required UI elements
        $("#main-row").append('<div id="samba"></div>');
        $("#samba").load(
        	'plugin/03_samba/plugin.html',
            function() { ko.applyBindings(dashboard.viewModel); }
            );
    };

    window.Dashboard.plugins.push(Samba);

}(window, jQuery));