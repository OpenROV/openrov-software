var OFFSET = 90;
var ArduinoPhysics = function() {

    var physics = {};

    physics.mapMotors = function(throttle, yaw, vertical){
        var port = 0,
            starbord = 0;
        port = starbord = throttle;
        port += yaw;
        starbord -= yaw;
        port = map(port);
        starbord = map(starbord);
        vertical = Math.round(exp(vertical)) + OFFSET;
        return {
            port: port,
            starbord: starbord,
            vertical: vertical
        }
    };

    physics.mapVoltageReading = function(voltage){
        return mapA(voltage, 0, 1023,0,12);
    };

    physics.mapTiltServo = function (value) {
        return value + OFFSET;
    };

    physics.mapLight = function (value) {
        return mapA(value, 0,10,0,180);
    };

    return physics;
}

function mapA(x, in_min, in_max, out_min, out_max)
{
    return (x - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}

function map(val) {
    val = limit(val, -90, 90);
    val = Math.round(exp(val));
    val += OFFSET;
    return val;
}

function exp(val) {
    if(val === 0) return 0;
    var sign = val / Math.abs(val);
    var adj = Math.pow(90, Math.abs(val) / 90);
    return sign * adj;
}

function limit(value, l, h) { // truncate anything that goes outside of max and min value
    return Math.max(l, Math.min(h, value));
}


module.exports = ArduinoPhysics;