(function (window, $, undefined) {
    'use strict';

    var Capestatus;

    Capestatus = function Capestatus(cockpit) {
        console.log("Loading Capestatus plugin in the browser.");

        // Instance variables
        this.cockpit = cockpit;
	this.lastPing = null;

        // Add required UI elements
        $("#footer").append(
	  '<div class="navbar-inner"> \
            <div class="container-fluid" style="height: 100%"> \
              <div class="span1 pull-left"><h6>Connection</h6><div id="connectionHealth">&nbsp;</div></div> \
	      <div class="span2 hidden pull-right"><h6>Temperature</h6><h2 data-bind="html: convertedTemperature"></h2></div> \
              <div class="span2 hidden pull-right"><div class="pull-right" id="depth-gauge"></div><h6>Depth:</h6><h2 data-bind="text: convertedDepth"></h2></div> \
                <div class="span2 pull-right"><h2 id="formattedRunTime">time</h2><h4 id="localtime">&nbsp;</h4></div> \
		<div class="span2 pull-right"><h2 id="currentCpuUsage">&nbsp;</h2></div> \
                <div class="span2 pull-right"><h2 id="currentVoltage">&nbsp;</h2><div id="batteryIndicator">&nbsp;</div></div> \
		<div class="span2 pull-right"><h2 id="currentCurrent">&nbsp;</h2><div>&nbsp;</div></div> \
            </div> \
          </div>');
	
	$("#servoTilt").append('<p>Servo Tilt: <img id="servoTiltImage" src="themes/OpenROV/img/servo_tilt.png" class="center"></p>'); //attr style
	
	$("#lights").append('<p><div id="brightnessIndicator"></div></p>'); //attr class

        // Register the various event handlers
        this.listen();
	var capes = this;
        setInterval(function(){capes.updateConnectionStatus();}, 1000);

	setInterval(function () {
	    $("#localtime").text((new Date()).toLocaleTimeString(), 1000);
	});
    };
    
    //This pattern will hook events in the cockpit and pull them all back
    //so that the reference to this instance is available for further processing
    Capestatus.prototype.listen = function listen() {
        var capes = this;
	this.cockpit.socket.on('status', function(data) {
            capes.UpdateStatusIndicators(data);
        });
    };
    
    Capestatus.prototype.batteryLevel = function batteryLevel(voltage){
        if(voltage < 9)
            return "level1";
        if(voltage < 10)
            return "level2";
        if(voltage < 10.5)
            return "level3";
        if(voltage < 11.5)
            return "level4";
        return "level5";
    };    

    Capestatus.prototype.UpdateStatusIndicators = function UpdateStatusIndicators(data){
	var self = this;
	if ('time' in data) {
	    $("#formattedRunTime").text(msToTime(data.time));
	};
	if ('vout' in data) {
	    $("#currentVoltage").text(data.vout.toFixed(1) + 'v');
	    $("#batteryIndicator").attr('class',self.batteryLevel(data.vout));
	};
	if ('iout' in data) $("#currentCurrent").text(data.iout.toFixed(3) + 'A');
	if ('servo' in data) {
	    var angle = (90/500)*data.servo+90//*-45;
	    $("#servoTiltImage").attr("style", "-webkit-transform: rotate("+angle+"deg); -moz-transform: rotate("+angle+"deg);transform: rotate("+angle+"deg)");   
	};
	if ('cpuUsage' in data) $("#currentCpuUsage").text((data.cpuUsage*100).toFixed(0) + '%');
	if ('ligp' in data) $("brightnessIndicator").attr('class',(data.ligp*100).toFixed(0));

	this.lastPing = new Date();	
    };
    
    Capestatus.prototype.updateConnectionStatus = function(){
        var now = new Date();
        var delay = now - this.lastPing;
        if(delay>3000)
            $("#connectionHealth").attr("class","false");
        else
            $("#connectionHealth").attr("class","true");
    };
    


    window.Cockpit.plugins.push(Capestatus);

}(window, jQuery));
