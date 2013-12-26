(function (window, $, undefined) {
    'use strict';

    var Software;

    Software = function(dashboard) {

        var viewModel = { 
            packages : ko.observableArray(),
            loading : ko.observable(false)
         };
         viewModel.refresh = function() {
            viewModel.loading(true);
            $.getJSON("/softwarepackages", function(data) { 
                viewModel.packages.removeAll();
                data.forEach(function(item) {
                    viewModel.packages.push(item);
                    });
                viewModel.loading(false);
                })
            };
 
        viewModel.refresh();    
        dashboard.viewModel.software = viewModel;

        // Add required UI elements
        $("#menu-bar").append('<li><a href="#software-dialog" class="btn btn-link" data-toggle="modal">Software versions</a></li>');
        $("body").append('<div id="software"></div>');
        $("#software").load(
        	'plugin/99_software/plugin.html',
            function() { ko.applyBindings(dashboard.viewModel); }
            );


        console.log("Loaded Software plugin.");
    };
    window.Dashboard.plugins.push(Software);

}(window, jQuery));