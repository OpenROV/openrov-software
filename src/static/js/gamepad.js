var GamePad = function() {
  var gp = {};

    var padStatus = {
        position: {
            throttle: 0,
            yaw: 0,
            lift: 0
        },
        tilt: 0,
        light: 0
    }

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


    var updateLightStatus = function(buttons){
        var lightValue=0;
        if(buttons[12]==1)
            lightValue=1;
        if(buttons[13]==1)
            lightValue=-1;
        if(padStatus.light!=lightValue){
            padStatus.light=lightValue;
            brightnessHandler(padStatus.light);
        }
    };

    var updateTiltStatus = function(buttons){
        var servoValue=0;
        if(buttons[3]==1)
            servoTiltHandler(1);
        if(buttons[1]==1)
            servoTiltHandler(0);
        if(buttons[0]==1)
            servoTiltHandler(-1);
    };

    gp.getPositions = function() {
        window.requestAnimationFrame(updateStatus);
        return padStatus.position;
    }

    var updateStatus = function() {
    window.requestAnimationFrame(updateStatus);

    var pad = getPads()[0];
        if(pad){
            var axes = pad.axes;
            var buttons = pad.buttons;
            var positions = {
                throttle: 0,
                yaw: 0,
                lift: 0
            };
            if(buttons)
            {
                updateLightStatus(buttons);
                updateTiltStatus(buttons);
            }
            if(axes) {
                positions = {
                    throttle: -1*axes[1],
                    yaw: axes[0],
                    lift: -1*axes[3]
                };
            }
            padStatus.position = positions;
        }
  }

  gp.isAvailable = function() {
      if(isSupported())
        window.requestAnimationFrame(updateStatus);
        var pads = getPads();
        if(pads!=undefined && pads[0]!=undefined){
            return true;
        }
      return false;
  }

  return gp;
}