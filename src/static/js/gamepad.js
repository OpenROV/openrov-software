//http://www.html5rocks.com/en/tutorials/doodles/gamepad/gamepad-tester/tester.html
//useful for testing the buttons and finding the numbers
var GamePad = function() {
  var gp = {};
  
    var deadzone=.03;

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
    
    var powerLevel = .4;
    var updatePowerLevels = function(buttons){
      
        if (buttons[8]==1) //Start {
          powerLevel+= .2;
        if (powerLevel > 1) powerLevel = .2;
        
    };

    var ttrim = 0;
    var ltrim = 0;
    var buttonregisterd = -1;
    var axesregisterd = -1;
    var updateTrim = function(buttons,axes){

        if(buttons[5]==1 && buttonregisterd ==-1){ //right top sholder
            ttrim++;;
            buttonregisterd = 5;
        }
        if(axes[5]==1 && axesregisterd ==-1){ //right lower sholder
            ttrim--;
            axesregisterd = 5;
        }
        if(buttons[4]==1 && buttonregisterd ==-1){ //left top sholder
            ltrim++;
            buttonregisterd = 4;
        }
        if(axes[2]==1 && axesregisterd ==-1){ //left lower sholder
            ltrim--;
            axesregisterd = 2;
        }
        if(buttons[6]==1 && buttonregisterd ==-1){ //first stick button
            ttrim=0;
            buttonregisterd = 6;
        }
        if(buttons[7]==1 && buttonregisterd ==-1){ //2nd stick button
            ltrim=0;
            buttonregisterd = 7;
        }
        if (buttonregisterd>-1 && buttons[buttonregisterd] == 0) buttonregisterd = -1;
        if (axesregisterd>-1 && axes[axesregisterd] == -1) axesregisterd = -1;

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
                updatePowerLevels(buttons);
                updateTrim(buttons,axes);
            }
            if(axes) {
                updateTrim(buttons,axes);
                positions = {
                    throttle: -1*axes[1]*powerLevel,
                    yaw: axes[0]*powerLevel,
                    lift: -1*axes[3]*powerLevel
                };
                if (positions.throttle > -deadzone && positions.throttle < deadzone) positions.throttle = 0;
                if (positions.yaw > -deadzone && positions.yaw < deadzone) positions.yaw = 0;
                if (positions.lift > -deadzone && positions.lift < deadzone) positions.lift = 0;
                if (positions.throttle ==0) {
                  positions.throttle = (1/1000)*ttrim;
                }
                if (positions.lift ==0) positions.lift = (1/1000)*ltrim;
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