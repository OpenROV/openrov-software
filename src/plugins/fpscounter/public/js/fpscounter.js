(function (window, $, undefined) {
    'use strict';

    var FPSCounter;

    FPSCounter = function FPSCounter(cockpit) {
        console.log("Loading FPSCounter plugin in the browser.");

        // Instance variables
        this.cockpit = cockpit;
        
         $.getScript("bower_components/fpsmeter/dist/fpsmeter.js",function(){

	  $("#menu").append("<span id='fpsmeter'></span>");
	  var meter = new FPSMeter($("#video-container")[0],
						  {
						  interval:  100,     // Update interval in milliseconds.
						  smoothing: 10,      // Spike smoothing strength. 1 means no smoothing.
						  show:      'fps',   // Whether to show 'fps', or 'ms' = frame duration in milliseconds.
						  toggleOn:  'click', // Toggle between show 'fps' and 'ms' on this event.
						  decimals:  1,       // Number of decimals in FPS number. 1 = 59.9, 2 = 59.94, ...
						  maxFps:    30,      // Max expected FPS value.
						  threshold: 100,     // Minimal tick reporting interval in milliseconds.
					  
						  // Meter position
						  position: 'absolute', // Meter position.
						  zIndex:   10,         // Meter Z index.
						  left:     '5px',      // Meter left offset.
						  top:      '5px',      // Meter top offset.
						  right:    'auto',     // Meter right offset.
						  bottom:   'auto',     // Meter bottom offset.
						  margin:   '0 0 0 0',  // Meter margin. Helps with centering the counter when left: 50%;
					  
						  // Theme
						  theme: 'colorful', // Meter theme. Build in: 'dark', 'light', 'transparent', 'colorful'.
						  heat:  1,      // Allow themes to use coloring by FPS heat. 0 FPS = red, maxFps = green.
					  
						  // Graph
						  graph:   1, // Whether to show history graph.
						  history: 20 // How many history states to show in a graph.
	  });
          
	  $("#menu").append("<span id='fpsmeter2'></span>");
	  var beagletoBrowserMeter = new FPSMeter($("#video-container")[0],
						  {
						  interval:  100,     // Update interval in milliseconds.
						  smoothing: 10,      // Spike smoothing strength. 1 means no smoothing.
						  show:      'fps',   // Whether to show 'fps', or 'ms' = frame duration in milliseconds.
						  toggleOn:  'click', // Toggle between show 'fps' and 'ms' on this event.
						  decimals:  1,       // Number of decimals in FPS number. 1 = 59.9, 2 = 59.94, ...
						  maxFps:    1,      // Max expected FPS value.
						  threshold: 100,     // Minimal tick reporting interval in milliseconds.
					  
						  // Meter position
						  position: 'absolute', // Meter position.
						  zIndex:   10,         // Meter Z index.
						  left:     '150px',      // Meter left offset.
						  top:      '5px',      // Meter top offset.
						  right:    'auto',     // Meter right offset.
						  bottom:   'auto',     // Meter bottom offset.
						  margin:   '0 0 0 0',  // Meter margin. Helps with centering the counter when left: 50%;
					  
						  // Theme
						  theme: 'colorful', // Meter theme. Build in: 'dark', 'light', 'transparent', 'colorful'.
						  heat:  1,      // Allow themes to use coloring by FPS heat. 0 FPS = red, maxFps = green.
					  
						  // Graph
						  graph:   1, // Whether to show history graph.
						  history: 20 // How many history states to show in a graph.
	  });          
	  
	  setInterval(function(){
	    meter.tick();
	  },32);
          
            cockpit.socket.on('status', function(data) {
                if ('time' in data) beagletoBrowserMeter.tick();
            });
        });

    };

    window.Cockpit.plugins.push(FPSCounter);

}(window, jQuery));
