(function (window, $, undefined) {
    'use strict';

    var ROVpilot;

    ROVpilot = function ROVpilot(cockpit) {
        console.log("Loading ROVpilot plugin in the browser.");

        // Instance variables
        this.cockpit = cockpit;
        this.power = .5; //default to mid power
        this.vtrim = 0; //default to no trim
        this.ttrim = 0;
        this.tilt = 0;
        this.light = 0;
        this.positions = {
            throttle: 0,
            yaw: 0,
            lift: 0
        };
        this.sendUpdateEnabled = true;
        var SAMPLE_PERIOD = 1000 / CONFIG.sample_freq; //ms
	this.priorControls = {};

        // Add required UI elements
        $("#menu").prepend('<div id="example" class="hidden">[example]</div>');

        var self = this;
        setInterval(function() {
            self.sendPilotingData();
        }, SAMPLE_PERIOD);
        
        this.listen();
        
    };
    
    //This pattern will hook events in the cockpit and pull them all back
    //so that the reference to this instance is available for further processing
    ROVpilot.prototype.listen = function listen() {
        var rov = this;
        
        KEYS[32] = {keydown: function(){ rov.allStop()}};// space (all-stop)
        KEYS[38] = {keydown: function(){ rov.setThrottle(1)},
                    keyup:   function(){ rov.setThrottle(0)}}; // up  (forward)
        KEYS[40] = {keydown: function(){ rov.setThrottle(-1)},
                    keyup:   function(){ rov.setThrottle(0)}};  // down (aft)       
        KEYS[37] = {keydown: function(){ rov.setYaw(-1)},
                    keyup:   function(){ rov.setYaw(0)}};// left (turn left) 
        KEYS[39] = {keydown: function(){ rov.setYaw(1)},
                    keyup:   function(){ rov.setYaw(0)}};// right (turn right) 
        KEYS[16] = {keydown: function(){ rov.setLift(-1)},// shift (lift up)
                    keyup:   function(){ rov.setLift(0)}};
        KEYS[17] = {keydown: function(){ rov.setLift(1)}, //ctrl (lift down)
                    keyup:   function(){ rov.setLift(0)}};
        KEYS[49] = {keydown: function(){ rov.powerLevel(1)}}; //1
        KEYS[50] = {keydown: function(){ rov.powerLevel(2)}}; //2
        KEYS[51] = {keydown: function(){ rov.powerLevel(3)}}; //3
        KEYS[52] = {keydown: function(){ rov.powerLevel(4)}}; //4
        KEYS[53] = {keydown: function(){ rov.powerLevel(5)}}; //5
        KEYS[55] = {keydown: function(){ rov.adjustVerticleTrim(1)}}; //7 (vtrim)
        KEYS[56] = {keydown: function(){ rov.adjustVerticleTrim(-1)}}; //8 (vttrim)
        KEYS[57] = {keydown: function(){ rov.adjustThrottleTrim(-1)}}; //9 (ttrim -)
        KEYS[48] = {keydown: function(){ rov.adjustThrottleTrim(1)}}; //0 (ttrim +)      
        KEYS[81] = {keydown: function(){ rov.adjustCameraTilt(.1)}}; //Q (tilt up)   
        KEYS[65] = {keydown: function(){ rov.setCameraTilt(0)}};  //A (tilt fwd)     
        KEYS[90] = {keydown: function(){ rov.adjustCameraTilt(-.1)}}; //Z (tilt down)  
        KEYS[80] = {keydown: function(){ rov.adjustLights(.1)}}; //p (brightness up) 
        KEYS[79] = {keydown: function(){ rov.adjustLights(-.1)}}; //o (brightness down) 
        KEYS[76] = {keydown: function(){ rov.toggleLasers();}}; //l (laser toggle) 


    };


    ROVpilot.prototype.setCameraTilt = function setCameraTilt(value){
        this.tilt=value;
        if (this.tilt > 1) this.tilt =1;
        if (this.tilt < -1) this.tilt = -1;
        this.cockpit.socket.emit('tilt_update',this.tilt);
    };
    
    ROVpilot.prototype.adjustCameraTilt = function adjustCameraTilt(value){
        this.tilt+=value;
        this.setCameraTilt(this.tilt);
    };
    
    ROVpilot.prototype.adjustLights = function adjustLights(value){
        if (this.light==0 && value<0){ //this code rounds the horn so to speak by jumping from zero to max and vise versa
	  this.light = 1;
	} else if (this.light==1 && value>0){
	  this.light = 0;
	} else {
	  this.light += value;
	}
	if (this.light>1) this.light = 1;
	if (this.light<0) this.light = 0;
        this.cockpit.socket.emit('brightness_update',this.light);
    };
    
    ROVpilot.prototype.toggleLasers = function toggleLasers(){
        this.cockpit.socket.emit('laser_update');
    };
    
    ROVpilot.prototype.adjustVerticleTrim = function adjustVerticleTrim(value){
        this.vtrim+=value;
        this.positions.lift = (1/1000)*vtrim;
    };

    ROVpilot.prototype.adjustThrottleTrim = function adjustThrottleTrim(value){
        this.ttrim+=value;
        this.positions.throttle = (1/1000)*ttrim;
    };
    
    ROVpilot.prototype.setThrottle = function setThrottle(value){
        this.positions.throttle = value;
        if (value==0) this.positions.throttle = this.ttrim;
    };

    ROVpilot.prototype.setLift = function setLift(value){
        this.positions.lift = value;
        if (value==0) this.positions.lift = this.vtrim;
    };    

    ROVpilot.prototype.setYaw = function setYaw(value){
        this.positions.yaw = value;
    };
    
    ROVpilot.prototype.powerLevel = function powerLevel(value){
        switch(value){
            case 1:
                this.power = .05    
            break;           
            case 2:
                this.power = .1    
            break;
            case 3:
                this.power = .2    
            break;        
            case 4:
                this.power = .5    
            break;
            case 5:
                this.power = 1    
            break;
        }
    };      
    
    ROVpilot.prototype.allStop = function allStop(){
        vtrim = 0;
        ttrim = 0;
        positions.throttle = 0;
        positions.yaw = 0;
        positions.lift = 0;
    };
    
    ROVpilot.prototype.sendPilotingData = function sendPilotingData(){ 
        var positions = this.positions;
	var updateRequired = false;  //Only send if there is a change
        var controls = {};
        
        for(var i in positions) {
	    controls[i] = positions[i];
	    if (controls[i] != this.priorControls[i])
	    {
                updateRequired = true;
	    }
	}
	      
        if(this.sendUpdateEnabled && updateRequired){
            this.cockpit.socket.emit('control_update', controls);
	    this.priorControls = controls;
        };
    }
 
    window.Cockpit.plugins.push(ROVpilot);

}(window, jQuery));
