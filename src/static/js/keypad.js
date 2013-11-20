var KEYS = {
  32: { // space (all-stop)
    command: 'stop'
  },
  38: { // up (forward)
    command: 'command',
    position: 'throttle',
    value: 1
  },
  40: { // down (aft)
    command: 'command',
    position: 'throttle',
    value: -1
  },
  37: { // left (turn left)
    command: 'command',
    position: 'yaw',
    value: -1
  },
  39: { // right (turn right)
    command: 'command',
    position: 'yaw',
    value: 1
  },
  16: { // shift (lift up)
    command: 'command',
    position: 'lift',
    value: -1 //default 1
  },
  17: { //ctrl (lift down)
    command: 'command',
    position: 'lift',
    value: 1 //default -1
  },
  49: { //1 (power-1)
    command: 'power',
    value: .05 //def .1
  },
  50: { //2 (power-2)
    command: 'power',
    value: .1 //def .25
  },
  51: { //3 (power-3)
    command: 'power',
    value: .2 //def .5
  },
  52: { //4 (power-4)
    command: 'power',
    value: .5 //def .75
  },
  53: { //5 (power-5)
    command: 'power',
    value: 1 //def 1
  },
  55: { //7 (vtrim)
    command: 'vtrim',
    value: 1
  },
  56: { //8 (vttrim)
    command: 'vtrim',
    value: -1
  },
  57: { //9 (ttrim -)
    command: 'ttrim',
    value: -1
  },
  48: { //0 (ttrim +) 
    command: 'ttrim',
    value: 1
  }, 
  81: { //Q (tilt up)
    command: 'tilt',
    value: 1
  },
  65: { //A (tilt fwd)
    command: 'tilt',
    value: 0
  },
  90: { //Z (tilt down)
    command: 'tilt',
    value: -1
  },
  80: { //p (brightness up) 
     command: 'light',
     value: 1
  },
  79: { //o (brightness down) 
     command: 'light',
     value: -1
  },
  73: { //i (brightness toggle)
    command: 'light',
    value: 0
  },
  76: { //l (laser toggle) 
     command: 'claser'
  }
}

var KeyPad = function() {
  var power = .5; //default to mid power
  var vtrim = 0; //default to no trim
  var ttrim = 0;
  var tilt = 0;
  var kp = {};
  var servoTiltHandler = function(value){};
  var brightnessHandler = function(value){};
  var claserHandler = function(){};
  var processKeys = true;

  kp.bindServoTilt = function(callback){
      servoTiltHandler=callback;
  };

  kp.bindBrightness = function(callback){
      brightnessHandler=callback;
  };
    
  kp.bindLasers = function(callback){
    claserHandler=callback;
  };

  kp.bindKeys = function(){
    processKeys = true;
  };
  
  kp.unbindKeys = function(){
    processKeys = false;
  }
  
  var vtrimHandler = function(value){
    vtrim+=value;
    positions.lift = (1/1000)*vtrim;
  };

  var ttrimHandler = function(value){
    ttrim+=value;
    positions.throttle = (1/1000)*ttrim;
  };

  var stopHandler = function(){
    vtrim = 0;
    ttrim = 0;
    positions.throttle = 0;
    positions.yaw = 0;
    positions.lift = 0;
  };

  var positions = {
    throttle: 0,
    yaw: 0,
    lift: 0
  };

  $(window).keydown(function(evt) {
    var info = KEYS[evt.keyCode];
    if ((!info) || (!processKeys)) return;
    evt.preventDefault();
    if(info.command=='command')
        positions[info.position] = info.value*power;
    else if(info.command=='tilt'){
        tilt+=info.value*(30/360); //30 degree incriments
	if(info.value == 0) tilt = 0;
        servoTiltHandler(tilt);}
    else if(info.command=='light')
        brightnessHandler(info.value);
    else if(info.command=='claser')
        claserHandler();	
    else if(info.command=='power')
        power=info.value;
    else if(info.command=='vtrim')
	vtrimHandler(info.value);
    else if (info.command=='ttrim')
	ttrimHandler(info.value);
    else if(info.command=='stop')
	stopHandler();
  });

  $(window).keyup(function(evt) {
    var info = KEYS[evt.keyCode];
    if ((!info) || (!processKeys)) return;
    evt.preventDefault();
    if(info.command=='command'){
       positions[info.position] = 0;
       if (info.position == 'throttle') 
         positions.throttle = (1/1000)*ttrim;
       if (info.position == 'lift')
         positions.lift = (1/1000)*vtrim;
    }
    //else if(info.command=='tilt')
    //    servoTiltHandler(info.value);
  });

  kp.getPositions = function() {
    return positions;
  }

  kp.isAvailable = function() {
    return true;
  }

  return kp;
}
