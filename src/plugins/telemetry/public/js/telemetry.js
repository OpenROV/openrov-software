(function (window, $, undefined) {
    'use strict';

    var Telemetry;

    Telemetry = function Telemetry(cockpit) {
        console.log("Loading Telemetry plugin in the browser.");

        // Instance variables
        this.cockpit = cockpit;
	this.telemetry = new Object();
	this.rawTelemetry = ko.observableArray([]);

        // Add required UI elements
	$("#rov_status_panel").append(
                '<div id="telemetry" class="controller well well-small" >\
		    <ul>\
		       <li id="TelemetryList">\
		       </li>\
		    </ul>\
		</div>');


/*
        // Add required UI elements
	$("#rov_status_panel").append(
                '<div id="telemetry" class="controller well well-small" >\
		    <ul data-bind="foreach: rawTelemetry">\
		       <li>\
		           <span data-bind="text: key"></span>\
		           <span data-bind="text: value"></span>\
		       </li>\
		    </ul>\
		</div>');
*/	
	var self = this;
        setInterval(function(){self.displayTelemetry();}, 1000);	
        // Register the various event handlers
        this.listen();
	ko.applyBindings(this,$("#rov_status_panel")[0]);
        
    };
    
    //This pattern will hook events in the cockpit and pull them all back
    //so that the reference to this instance is available for further processing
    Telemetry.prototype.listen = function listen() {
        var self = this;

	this.cockpit.socket.on('status', function(data) {
            self.logStatusData(data);
        });

    };
    
    Telemetry.prototype.logStatusData = function logStatusData(data){
	for (var i in data){
	  this.telemetry[i] = data[i];
	};
   };

/*  var div = document.getElementsByTagName("div");
 
var fragment = document.createDocumentFragment();
for ( var e = 0; e < elems.length; e++ ) {
    fragment.appendChild( elems[e] );
}
 
for ( var i = 0; i < div.length; i++ ) {
    div[i].appendChild( fragment.cloneNode(true) );
} */

    Telemetry.prototype.displayTelemetry = function displayTelemetry(){
	this.rawTelemetry([]);
	var fragment = document.createDocumentFragment();
	
	for (var item in this.telemetry){
	  if (this.telemetry.hasOwnProperty(item)) {
	    //this.rawTelemetry().push({ key: item, value: this.telemetry[item] });
	    var li = document.createElement("LI");
	    li.appendChild(document.createElement("SPAN").appendChild(document.createTextNode(item+" ")));
	    li.appendChild(document.createElement("SPAN").appendChild(document.createTextNode(this.telemetry[item])));
	    fragment.appendChild(li);
	  }
	}
	$('#TelemetryList').empty();
	$('#TelemetryList')[0].appendChild(fragment.cloneNode(true));
		
	//this.rawTelemetry.valueHasMutated();
   };

    window.Cockpit.plugins.push(Telemetry);

}(window, jQuery));
