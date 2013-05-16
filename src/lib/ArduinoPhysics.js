var OFFSET = 1500;

var ArduinoPhysics = function() {

    var physics = {};
      var CONFIG = require('./config');
    //For mapping to the motor Microseconds range from 1000 to 2000. This
    //is mostly a pass through for now as we want to keep the numbers consistent
    //from the UI to the controller for ease of troubleshooting for now.
    //Perhaps we will shift the range to -500..0..500 in the future.
    physics.mapRawMotor = function (val) {
      val = limit(val,-1,1);
      val = mapA(val,-1,1,1000,2000);
      val = Math.round(val);
      return val;
    };
    
    //This maps around deadzone
     physics.mapMotor = function (val) {
      val = limit(val,-1,1);
      var result;
      if (val<0) result = mapA(val,-1,0,1000,physics.mapRawMotor(CONFIG.preferences.get('deadzone_neg')));
      if (val>0) result = mapA(val,0,1,physics.mapRawMotor(CONFIG.preferences.get('deadzone_pos')),2000);
      if (val==0) result=1500; 
      result = Math.round(result);
      return result;
    };   
    
    physics.unmapMotor = function (val){
      val = mapA(val,1000,2000,-1,1);
    }

    physics.mapMotors = function(throttle, yaw, vertical){
        var port = 0,
            starbord = 0;
        port = starbord = throttle;
        port += yaw;
        starbord -= yaw;
        if (CONFIG.preferences.get('reverse_port_thruster')) port = port * -1;
        if (CONFIG.preferences.get('reverse_starbord_thruster')) starbord = starbord * -1;
        if (CONFIG.preferences.get('reverse_lift_thruster')) vertical = vertical * -1;
        return {
            port: physics.mapMotor(port),
            starbord: physics.mapMotor(starbord),
            vertical: physics.mapMotor(vertical)
        }
    };

    physics.mapVoltageReading = function(voltage){
        return mapA(voltage, 0, 1023,0,50);
    };

    //INA169 calculation, VOUT = (IS) (RS) (1000µA/V) (RL)
    physics.mapCurrentReading = function(voltage){
        return mapA(voltage, 0, 1023, 0, 5) + .4; //add offset
    };

    physics.mapTiltServo = function (value) {
        value= limit(value,-.7,.7);
      return mapA(value,-1,1,1000,2000);
    };

    physics.mapLight = function (value) {
        return mapA(value, 0,10,0,255);
    };

    return physics;
}

function mapA(x, in_min, in_max, out_min, out_max)
{
    return (((x - in_min) * (out_max - out_min)) / (in_max - in_min)) + out_min;
}

function limit(value, l, h) { // truncate anything that goes outside of max and min value
    return Math.max(l, Math.min(h, value));
}


module.exports = ArduinoPhysics;
