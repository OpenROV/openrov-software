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
    value: 1
  },
  17: { //ctrl (lift down)
    command: 'command',
    position: 'lift',
    value: -1
  },
  49: { //1 (power-1)
    command: 'power',
    value: .1
  },
  50: { //2 (power-2)
    command: 'power',
    value: .25 
  },
  51: { //3 (power-3)
    command: 'power',
    value: .5
  },
  52: { //4 (power-4)
    command: 'power',
    value: .75
  },
  53: { //5 (power-5)
    command: 'power',
    value: 1
  },
  57: { //9 (vtrim -)
    command: 'vtrim',
    value: -1
  },
  48: { //0 (vtrim +) 
    command: 'vtrim',
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
  187: { //+ (brightness up) - Firefox and Opera not compatible
     command: 'light',
     value: 1
  },
  189: { //- (brightness down) - Firefox and Opera not compatible
     command: 'light',
     value: -1
  }
}

var KeyPad = function() {
  var power = .5; //default to mid power
  var vtrim = 0; //default to no trim
  var kp = {};
  var servoTiltHandler = function(value){};
  var brightnessHandler = function(value){};

  kp.bindServoTilt = function(callback){
      servoTiltHandler=callback;
  };

    kp.bindBrightness = function(callback){
        brightnessHandler=callback;
    };

  var vtrimHandler = function(value){
    vtrim+=value;
    positions.throttle = (1/1000)*vtrim;
  };

  var stopHandler = function(){
    vtrim = 0;
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
    if (!info) return;
    evt.preventDefault();
    if(info.command=='command')
        positions[info.position] = info.value*power;
    else if(info.command=='tilt')
        servoTiltHandler(info.value);
    else if(info.command=='light')
        brightnessHandler(info.value);
    else if(info.command=='power')
        power=info.value;
    else if(info.command=='vtrim')
	vtrimHandler(info.value);
    else if(info.command=='stop')
	stopHandler();
  });

  $(window).keyup(function(evt) {
    var info = KEYS[evt.keyCode];
    if (!info) return;
    evt.preventDefault();
    if(info.command=='command'){
       positions[info.position] = 0;
       if (info.position == 'throttle') 
         positions.throttle = (1/1000)*vtrim;
    }
    else if(info.command=='tilt')
        servoTiltHandler(info.value);
  });

  kp.getPositions = function() {
    return positions;
  }

  kp.isAvailable = function() {
    return true;
  }

  return kp;
}
