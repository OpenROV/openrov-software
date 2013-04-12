//http://www.html5rocks.com/en/tutorials/doodles/gamepad/gamepad-tester/tester.html
//useful for testing the buttons and finding the numbers
//
//Requires the https://github.com/kallaspriit/HTML5-JavaScript-Gamepad-Controller-Library
//library. 
var GamePad = function() {
  var gamepad = new Gamepad();
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

    var isSupported = function () {
    };

    var servoTiltHandler = function(value){};
    var brightnessHandler = function(value){};
    var detectionHandler = function(value){};

    //These must be bound to by the code that instantiates the gamepad.
    gp.bindServoTilt = function(callback){
        servoTiltHandler=callback;
    };
    gp.bindBrightness = function(callback){
        brightnessHandler=callback;
    };
    gp.bindDetectionEvent = function(callback){
        detectionHandler=callback;
    };

    gp.getPositions = function() {
        window.requestAnimationFrame(updateStatus);
        return padStatus.position;
    }

    var powerLevel = .4;
    var advancePowerLevels = function(){
        powerLevel+= .2;
        if (powerLevel > 1) powerLevel = .2;
        
    };

    var ttrim = 0;
    var ltrim = 0;
    gamepad.bind(Gamepad.Event.BUTTON_DOWN, function(e) {
      switch (e.control) {
        case 'DPAD_UP':
          brightnessHandler(1);
          break;
        case 'DPAD_DOWN':
          brightnessHandler(-1);
          break;
        case 'Y':
          servoTiltHandler(1);
          break;
        case 'B':
          servoTiltHandler(0);
          break;
        case 'A':
          servoTiltHandler(-1);
          break;
        case 'RB':
          ttrim = padStatus.position.throttle;
          ltrim = padStatus.position.lift; 
          break;
        case 'START':
          advancePowerLevels();
      };
    });    
    
  gamepad.bind(Gamepad.Event.AXIS_CHANGED, function(e) {
    switch (e.axis) {
      case 'LEFT_STICK_X':
        padStatus.position.yaw = e.value*powerLevel;
        break;
      case 'LEFT_STICK_Y':
        if (e.value == 0) {
          positions.throttle = (1/1000)*ttrim
        } else {
          padStatus.position.throttle = -1*e.value*powerLevel;
        }
        break;
      case 'RIGHT_STICK_Y':
        if (e.value == 0) {
          positions.lift = (1/1000)*ltrim
        } else {
          padStatus.position.lift = -1*e.value*powerLevel;
        }
        break;      
    }
    
  });

  var updateStatus = function() {
     window.requestAnimationFrame(updateStatus);
  }

  gamepad.bind(Gamepad.Event.CONNECTED, function(device) {
    console.log('Controller connected', device);
    detectionHandler();
  });

  gamepad.bind(Gamepad.Event.DISCONNECTED, function(device) {
    console.log('Controller disconnected', device);
    detectionHandler();
  });

  gamepad.bind(Gamepad.Event.UNSUPPORTED, function(device) {
    console.log('Unsupported controller connected', device);
  });  

  gp.isAvailable = function() {
    if(gamepad.count() == 0) return false;
      return true;
  }
  
  if (!gamepad.init()) {
          console.log('Your browser does not support gamepads, get the latest Google Chrome or Firefox.');
  }  

  return gp;
}