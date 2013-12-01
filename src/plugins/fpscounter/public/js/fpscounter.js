(function(window, $, undefined) {
    'use strict';

    var FPSCounter;

    FPSCounter = function FPSCounter(cockpit) {
        console.log("Loading FPSCounter plugin in the browser.");

        // Instance variables
        this.cockpit = cockpit;
        this.meter = null;
        this.beagletoBrowserMeter = null;
        
	    var _socket = this.cockpit.socket;
	    var self = this;
        
        $.getScript("bower_components/fpsmeter/dist/fpsmeter.js", function() {

            $("#menu").append("<span id='fpsmeter'></span>");
                self.meter = new FPSMeter($("#video-container")[0], {
                interval: 100, // Update interval in milliseconds.
                smoothing: 10, // Spike smoothing strength. 1 means no smoothing.
                show: 'fps', // Whether to show 'fps', or 'ms' = frame duration in milliseconds.
                toggleOn: 'click', // Toggle between show 'fps' and 'ms' on this event.
                decimals: 1, // Number of decimals in FPS number. 1 = 59.9, 2 = 59.94, ...
                maxFps: 30, // Max expected FPS value.
                threshold: 100, // Minimal tick reporting interval in milliseconds.

                // Meter position
                position: 'absolute', // Meter position.
                zIndex: 10, // Meter Z index.
                left: '5px', // Meter left offset.
                top: '5px', // Meter top offset.
                right: 'auto', // Meter right offset.
                bottom: 'auto', // Meter bottom offset.
                margin: '0 0 0 0', // Meter margin. Helps with centering the counter when left: 50%;

                // Theme
                theme: 'colorful', // Meter theme. Build in: 'dark', 'light', 'transparent', 'colorful'.
                heat: 1, // Allow themes to use coloring by FPS heat. 0 FPS = red, maxFps = green.

                // Graph
                graph: 1, // Whether to show history graph.
                history: 20 // How many history states to show in a graph.
            });
            self.meter.hide();

            $("#footercontent").append("<span id='fpsmeter2'></span>");
                self.beagletoBrowserMeter = new FPSMeter($("#fpsmeter2")[0], {
                interval: 1000, // Update interval in milliseconds.
                smoothing: 20, // Spike smoothing strength. 1 means no smoothing.
                show: 'ms', // Whether to show 'fps', or 'ms' = frame duration in milliseconds.
                toggleOn: 'click', // Toggle between show 'fps' and 'ms' on this event.
                decimals: 1, // Number of decimals in FPS number. 1 = 59.9, 2 = 59.94, ...
                maxFps: 2, // Max expected FPS value.
                threshold: 1000, // Minimal tick reporting interval in milliseconds.

                // Meter position
                position: 'absolute', // Meter position.
                zIndex: 10, // Meter Z index.
                left: '0px', // Meter left offset.
                top: '30px', // Meter top offset.
                right: 'auto', // Meter right offset.
                bottom: 'auto', // Meter bottom offset.
                margin: '0 0 0 0', // Meter margin. Helps with centering the counter when left: 50%;

                // Theme
                theme: 'colorful', // Meter theme. Build in: 'dark', 'light', 'transparent', 'colorful'.
                heat: 1, // Allow themes to use coloring by FPS heat. 0 FPS = red, maxFps = green.

                // Graph
                graph: 1, // Whether to show history graph.
                history: 20 // How many history states to show in a graph.
            });


            
            /*
            setInterval(function() {
                var bmeter = beagletoBrowserMeter;
                bmeter.tickStart();
                var _starttime = new Date();
                FPSCounter.ping('192.168.1.27',function(target,port,status){
                    bmeter.tick();
                    var _endtime = new Date();
                }, 8080, 300)
            },500);
            */
            self.listen();
            var _self = self;
	        var mysocket = _socket;
	        
            setInterval(function() {
                _self.meter.tick();
            }, 32);	        
	        
            setInterval(function() {
                var _starttime = new Date(); 
                _self.beagletoBrowserMeter.tickStart();
                mysocket.emit('ping',_starttime);
            }, 500);            
            
            _socket.on('pong', function(id) {
                _self.beagletoBrowserMeter.tick();
                var _endtime = new Date();
                console.log('ping pong: ' + (_endtime-id));
             });

        });
        

    };
    
    FPSCounter.prototype.listen = function listen() {
        var _fpscounter = this;
		KEYS[70] = {keydown: function(data) {  //f
   		 _fpscounter.toggleDisplay();
		}};
    };

    FPSCounter.prototype.toggleDisplay = function toggleDisplay() {
        this.meter.isPaused ? this.meter.show() : this.meter.hide();
    };

    FPSCounter.ping = function ping(target, callback, port, timeout) {
        var timeout = (timeout == null) ? 100 : timeout;
        var port = port || 80;
        var img = new Image();
        img.onerror = function() {
            if (!img) return;
            img = undefined;
            callback(target, port, 'open');
        };
        img.onload = img.onerror;
        img.src = 'http://' + target + ':' + port +"/ping.png/?cachebreaker="+new Date().getTime();

        setTimeout(function() {
            if (!img) return;
            img = undefined;
            callback(target, port, 'closed');
        }, timeout);
    };

    window.Cockpit.plugins.push(FPSCounter);

}(window, jQuery));
