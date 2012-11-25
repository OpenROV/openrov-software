var GamePad = function() {
  var gp = {};

    if ( !window.requestAnimationFrame ) {
        window.requestAnimationFrame = ( function() {
            return window.webkitRequestAnimationFrame ||
                window.mozRequestAnimationFrame ||
                window.oRequestAnimationFrame ||
                window.msRequestAnimationFrame ||
                function( /* function FrameRequestCallback */ callback, /* DOMElement Element */ element ) {
                    window.setTimeout( callback, 1000 / 60 );
                };
        })();
    }

    var getPadsFunction = function () {
        return navigator.webkitGetGamepads || navigator.mozGetGamepads || navigator.getGamepads;
    };

    var getPadsField = function() {
        return navigator.webkitGamepads || navigator.mozGamepads || navigator.gamepads;
    };

    var isSupported = function () {
        return ((getPadsField() != undefined) || (getPadsFunction() != undefined));
    };

    var getPads = function () {
        var getRawPads = getPadsFunction();
        var rawPads = getPadsField();
        if ((!rawPads) && (getRawPads)) {
            rawPads = getRawPads.call(navigator)
        }
        return rawPads;
    }

    var servoTiltHandler = function(value){};
    var brightnessHandler = function(value){};

    gp.bindServoTilt = function(callback){
        servoTiltHandler=callback;
    };
    gp.bindBrightness = function(callback){
        brightnessHandler=callback;
    };

    gp.getPositions = function() {
    window.requestAnimationFrame(gp.getPositions);

    var pad = getPads()[0];
        if(pad){
            var axes = pad.axes;
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
  }

  gp.isAvailable = function() {
      if(isSupported())
        window.requestAnimationFrame(gp.getPositions);
        if(getPads()[0]!=undefined){
            return true;
        }
      return false;
  }

  return gp;
}