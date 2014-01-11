(function (window, $, undefined) {
    'use strict';

    var FlyByWire;

    FlyByWire = function Example(cockpit) {
        console.log("Loading FlyByWire plugin in the browser.");

        // Instance variables
        this.cockpit = cockpit;
	this.flybywireControlActive = false;
	this.originalsettings = new Object();
	this.leftx = 0;
	this.lefty = 0;
	this.rightx = 0;
	this.righty = 0;
	this.lift = 0;
	this.targetHeading = 0;
	this.targetDepth = 0;
	this.targetThrottle = 0;
	this.maxDegreeOfHeadingChange = 5;
	this.maxDepthChange = .10;

        // Add required UI elements
        $('#keyboardInstructions').append('<p><i>g</i> to toggle flybywire</p>');
	this.listen();
    };
        
    FlyByWire.prototype.listen = function listen() {
        var rov = this;
        
        KEYS[71] = {keydown: function(){rov.toggleControl(); }};// g
	cockpitEventEmitter.on('rovpilot.control_update',function(controls){if (rov.flybywireControlActive) {rov.processControlChanges(controls)}});

        this.cockpit.socket.on('navdata', function(data) {
            if (!jQuery.isEmptyObject(data)) {
		data.hdgd;
            }
	});
    };
    
    FlyByWire.prototype.processControlChanges = function processControlChanges(controls) {
	if (controls.throttle != this.targetThrottle) {
	    this.targetThrottle = controls.throttle ;
	    this.cockpit.socket.emit('thro',controls.throttle);    
	}

	if (controls.yaw != 0) {
	    this.targetHeading += this.maxDegreeOfHeadingChange * controls.yaw;
	    if (this.targetHeading >= 360)  this.targetHeading-=360;
	    if (this.targetHeading < 0)  this.targetHeading+=360;	    
	    this.cockpit.socket.emit('holdHeading_on',this.targetHeading);
	}
	
	if (controls.lift != 0) {
	    if ((controls.lift<0) && (this.targetDepth<=0)) return;
	    this.targetDepth += this.maxDepthChange * controls.lift;
	    if (this.targetDepth < 0)  this.targetDepth=0;    
	    this.cockpit.socket.emit('holdDepth_on',this.targetDepth);
	}	

    };

    FlyByWire.prototype.toggleControl = function toggleControl() {
	var rov = this;
	if (!this.flybywireControlActive) {
	    cockpitEventEmitter.emit('rovpilot.disable');

	    rov.originalsettings.lsx = GAMEPAD.LEFT_STICK_X ;
	    rov.originalsettings.lsy = GAMEPAD.LEFT_STICK_Y ;
	    rov.originalsettings.rsx = GAMEPAD.RIGHT_STICK_X ;
	    rov.originalsettings.rsy = GAMEPAD.RIGHT_STICK_Y ;
	    
	    GAMEPAD.LEFT_STICK_X    = {AXIS_CHANGED: function(v){
		var direction;
		rov.leftx = -v;
		if ((rov.leftx+rov.rightx)>=0) {
		    direction=1;
		} else {
		    direction=-1;
		}
		rov.lift = direction * Math.max(Math.abs(rov.leftx),Math.abs(rov.rightx));		
		cockpitEventEmitter.emit('rovpilot.manualMotorThrottle',rov.lefty,rov.lift,rov.righty);
	    } };
	    GAMEPAD.LEFT_STICK_Y    = {AXIS_CHANGED: function(v){
		var direction;
		rov.lefty = v;
		cockpitEventEmitter.emit('rovpilot.manualMotorThrottle',rov.lefty,rov.lift,rov.righty);
		}
	    };
	    GAMEPAD.RIGHT_STICK_X = {AXIS_CHANGED: function(v){
		var direction;
		rov.rightx = v;
		if ((rov.leftx+rov.rightx)>=0) {
		    direction=1;
		} else {
		    direction=-1;
		}
		rov.lift = direction * Math.max(Math.abs(rov.leftx),Math.abs(rov.rightx));	
		cockpitEventEmitter.emit('rovpilot.manualMotorThrottle',rov.lefty,rov.lift,rov.righty);
		console.log("rov.lift:" + rov.lift);
	    } };  
	   
	    GAMEPAD.RIGHT_STICK_Y   = {AXIS_CHANGED: function(v){
		var direction;
		rov.righty = v;
		cockpitEventEmitter.emit('rovpilot.manualMotorThrottle',rov.lefty,rov.lift,rov.righty);
		}
	    };
	    
	    //			LEFT_TRIGGER: 6,
		//	RIGHT_TRIGGER: 7,
	    this.cockpit.socket.emit('holdHeading_toggle');
	    this.cockpit.socket.emit('holdDepth_toggle');
	    rov.flybywireControlActive = true;
	    console.log("FlyByWire Control Active");
	} else {	    
	    GAMEPAD.LEFT_STICK_X = rov.originalsettings.lsx;
	    GAMEPAD.LEFT_STICK_Y = rov.originalsettings.lsy;
	    GAMEPAD.RIGHT_STICK_X = rov.originalsettings.rsx;
	    GAMEPAD.RIGHT_STICK_Y = rov.originalsettings.rsy;
	    rov.flybywireControlActive = false;
	    cockpitEventEmitter.emit('rovpilot.enable');
	    this.cockpit.socket.emit('holdHeading_toggle');
	    this.cockpit.socket.emit('holdDepth_toggle');
	    console.log("FlyByWire Control Deactivated");
	}
	
    };
    window.Cockpit.plugins.push(FlyByWire);

}(window, jQuery));
