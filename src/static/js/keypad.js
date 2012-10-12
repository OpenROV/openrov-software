var KEYS = {
  38: { // up (forward)
    position: 'throttle',
    value: 1
  },
  40: { // down (aft)
    position: 'throttle',
    value: -1
  },
  37: { // left (turn left)
    position: 'yaw',
    value: -1
  },
  39: { // right (turn right)
    position: 'yaw',
    value: 1
  },
  16: { // shift (lift up)
    position: 'lift',
    value: 1
  },
  17: { //ctrl (lift down)
    position: 'lift',
    value: -1
  }
}

var KeyPad = function() {
  var kp = {};

  var getAxes = function() {
    return navigator && navigator.webkitGamepads && navigator.webkitGamepads[0] && navigator.webkitGamepads[0].axes;
  }

  var positions = {
    throttle: 0,
    yaw: 0,
    lift: 0
  };

  $(window).keydown(function(evt) {
    var info = KEYS[evt.keyCode];
    if (!info) return;
    evt.preventDefault();
    positions[info.position] = info.value;
  });

  $(window).keyup(function(evt) {
    var info = KEYS[evt.keyCode];
    if (!info) return;
    evt.preventDefault();
    positions[info.position] = 0;
  });

  kp.getPositions = function() {
    return positions;
  }

  kp.isAvailable = function() {
    return true;
  }

  return kp;
}