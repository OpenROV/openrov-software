(function(window, document) {
        'use strict';

        /*
         * Constructuor
         */
	var telemetry = [];
        var Blackbox = function Blackbox(cockpit) {
                console.log("Loading Blackbox plugin.");
                this.cockpit = cockpit;
                this.recording = false;
		var blackbox = this;
                this.cockpit.socket.on('navdata', function(data) {
                    if (!jQuery.isEmptyObject(data)) {                      
                            blackbox.logNavData(data);
                    }        
                });
		this.cockpit.socket.on('status', function(data){
                    if (!jQuery.isEmptyObject(data)) {
                            blackbox.logStatusData(data);
                    }
                });

                // Register the various event handlers
                this.listen();
        };

        /*
         * Register keyboard event listener
         */
        Blackbox.prototype.listen = function listen() {
                var self = this;
                $(document).keydown(function(ev) {
                        self.keyDown(ev);
                });
        };

	var refreshintervalID;
	var server;
//	var telemetry = [];

	Blackbox.prototype.toggleRecording = function toggleRecording(){
		console.log("Recording = " + this.recording);
		if (!this.recording){
			console.log("Recording Telemetry");
			var blackbox = this;
			refreshintervalID = self.setInterval(blackbox.logTelemetryData,1000);	
		} else {
			console.log("Stopping Telemetry");
			clearInterval(refreshintervalID);
		}
		this.recording = !this.recording;

	};

	Blackbox.prototype.test = function(){console.log("tteesstt");blackbox.logTelemetryData()};

        /*
         * Process onkeydown. 
         */
        Blackbox.prototype.keyDown = function keyDown(ev) {
                if ([ev.keyCode] != 82) { //r
                        return;
                } 
                ev.preventDefault();
		
                if (!this.recording) {
                        this.openDB(this.toggleRecording());
                } else {
                        this.closeDB(this.toggleRecording());
                }
        };
        
        Blackbox.prototype.logNavData = function logNavData(navdata){
                 if (!this.recording) {
                        return;
                 }
                server.navdata.add(navdata).done( function ( item ) {
                    console.log("saved");
                } ); 
                
        };

        Blackbox.prototype.logTelemetryData = function logTelemetryData(){
		var clone = [];
		for (i in telemetry){
			clone[i] = telemetry[i];
		}
                server.telemetry.add(clone).done( function ( item ) {
                    console.log("saved telemetry");
                } )
		.fail( function (a,x) {console.log(x);});

        };

        Blackbox.prototype.logStatusData = function logStatusData(data){
                 if (!this.recording) {
                        return;
                 }
		for (i in data){
		  telemetry[i] = data[i];
		}
        };


        
        Blackbox.prototype.openDB = function openDB(callback){
        db.open( {
            server: 'openrov-blackbox',
            version: 4,
            schema: {
                navdata: {
                    key: { keyPath: 'id' , autoIncrement: true },
                    // Optionally add indexes
                    indexes: {
                    }
                },
                telemetry: {
                    key: { keyPath: 'id' , autoIncrement: true }

                    // Optionally add indexes
                }
            }
        } ).done( function ( s ) {
	    server = s;
            callback;
        } );
                
        };
        
        Blackbox.prototype.closeDB = function closeDB(callback){
                server.close();
		callback;
        };

        window.Cockpit.plugins.push(Blackbox);

}(window, document));
