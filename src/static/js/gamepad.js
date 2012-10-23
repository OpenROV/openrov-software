var GamePad = function() {
  var gp = {};

  var getAxes = function() {
    return navigator && navigator.webkitGamepads && navigator.webkitGamepads[0] && navigator.webkitGamepads[0].axes;
  }

  gp.getPositions = function() {
    var axes = getAxes();
    var positions = {
      throttle: 0,
      yaw: 0,
      lift: 0
    };
    if(!axes) return positions;
    return {
      throttle: -1*axes[1],
      yaw: axes[0],
      lift: -1*axes[3]
    };
  }

  gp.isAvailable = function() {
    return !!(navigator && navigator.webkitGamepads && navigator.webkitGamepads[0] && navigator.webkitGamepads[0].axes);
  }

  return gp;
}