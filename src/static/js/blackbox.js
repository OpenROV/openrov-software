(function(window, document) {
        'use strict';

        /*
         * Constructuor
         */
        var Blackbox = function Blackbox(cockpit) {
                console.log("Loading Blackbox plugin.");
                this.cockpit = cockpit;
                this.recording = false;
                this.cockpit.socket.on('navdata', function(data) {
                    if (!recording) {
                        return;
                    }
                    if (!jQuery.isEmptyObject(data)) {                      
                            Blackbox.logNavData(data);
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

        /*
         * Process onkeydown. 
         */
        Blackbox.prototype.keyDown = function keyDown(ev) {
                if ([ev.keyCode] != 82) { //r
                        return;
                } 
                ev.preventDefault();

                if (!this.recording) {
                        openDB(function (x) {this.recording = !this.recording;})
                } else {
                        closeDB(function (x) {this.recording = !this.recording;})
                }
        };
        
        Blackbox.prototype.logNavData = function logNavData(navdata){
                server.navdata.add(navdata).done( function ( item ) {
                    console.log("saved");
                } ); 
                
        };
        
        var server;      
        Blackbox.prototype.openDB = function openDB(callback){

        db.open( {
            server: 'openrov-blackbox',
            version: 1,
            schema: {
                navdata: {
                    key: { keyPath: 'id' , autoIncrement: true },
                    // Optionally add indexes
                    indexes: {
                        timestamp: { },
                    }
                }
            }
        } ).done( function ( s ) {
            server = s
        } );
                
        };
        
        Blackbox.prototype.closeDB = function closeDB(callback){
                server.close();
        };

        window.Cockpit.plugins.push(Blackbox);

}(window, document));
