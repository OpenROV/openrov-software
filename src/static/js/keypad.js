var KEYS = {
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
  187: { //+ (brightness up)
     command: 'light',
     value: 1
  },
  189: { //- (brightness down)
     command: 'light',
     value: -1
  }
}

var KeyPad = function() {
  var kp = {};
  var servoTiltHandler = function(value){};
  var brightnessHandler = function(value){};

  kp.bindServoTilt = function(callback){
      servoTiltHandler=callback;
  };

    kp.bindBrightness = function(callback){
        brightnessHandler=callback;
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
        positions[info.position] = info.value;
    else if(info.command=='tilt')
        servoTiltHandler(info.value);
    else if(info.command=='light')
        brightnessHandler(info.value);
  });

  $(window).keyup(function(evt) {
    var info = KEYS[evt.keyCode];
    if (!info) return;
    evt.preventDefault();
    if(info.command=='command')
       positions[info.position] = 0;
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