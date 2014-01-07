(function (window, $, undefined) {
    'use strict';

    var TankControl;

    TankControl = function Example(cockpit) {
        console.log("Loading TankControl plugin in the browser.");

        // Instance variables
        this.cockpit = cockpit;
	this.tankControlActive = false;
	this.originalsettings = new Object();
	this.leftx = 0;
	this.lefty = 0;
	this.rightx = 0;
	this.righty = 0;
	this.lift = 0;

        // Add required UI elements
        $('#keyboardInstructions').append('<p><i>t</i> to toggle tank control</p>');
	this.listen();
    };
    
    TankControl.prototype.listen = function listen() {
        var rov = this;
        
        KEYS[84] = {keydown: function(){rov.toggleControl(); }};// t
    };    

    TankControl.prototype.toggleControl = function toggleControl() {
	var rov = this;
	if (!this.tankControlActive) {
	  
	
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
	    rov.tankControlActive = true;
	    console.log("Tank Control Active");
	} else {
	    GAMEPAD.LEFT_STICK_X = rov.originalsettings.lsx;
	    GAMEPAD.LEFT_STICK_Y = rov.originalsettings.lsy;
	    GAMEPAD.RIGHT_STICK_X = rov.originalsettings.rsx;
	    GAMEPAD.RIGHT_STICK_Y = rov.originalsettings.rsy;
	    rov.tankControlActive = false;
	    console.log("Tank Control Deactivated");
	}
	
    };
    window.Cockpit.plugins.push(TankControl);

}(window, jQuery));
