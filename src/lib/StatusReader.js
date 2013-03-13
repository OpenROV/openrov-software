
var ArduinoPhysics = require('./ArduinoPhysics')
var os = require('./os-utils')

var CPUUsage =10;

var StatusReader = function() {

        var currTemp = 20;
        var currDepth = 0;
    var physics = new ArduinoPhysics();

    var reader = {};

	var currCpuUsage = 0;
	setInterval(function(){os.cpuUsage(function(v){currCpuUsage = v;});},1000);
    

    reader.parseStatus= function(rawStatus){
        var parts = rawStatus.split(';');
        var status = { depth: updateDepth(), temp: updateTemp()};

        for(var i=0;i<parts.length;i++){
            var subParts = parts[i].split(":");
            status[subParts[0]]=subParts[1];
        }
        status.vout=physics.mapVoltageReading(status.vout);
	status.iout=physics.mapCurrentReading(status.iout);
        
        status.cpuUsage = currCpuUsage;
       
        return status;
    }
	
	function updateTemp(){
		var temp;
		var rand = Math.random()*10;
		if(rand<5)
			temp = currTemp - (5-rand)/10;
		else
			temp = currTemp + (10-rand)/10;
		currTemp = temp;
		return currTemp;
	}

	var limitForDecrease=2;
	function updateDepth(){
		var depth;
		var rand = Math.random()*10;
		if(rand<limitForDecrease)
			depth = currDepth - (limitForDecrease-rand)*10;
		else
			depth = currDepth + (10-rand)*10;
		if(depth>0)
			currDepth = depth;
		else
			limitForDecrease=2;
		if(depth>9900)
			limitForDecrease=8;
		return Math.round(currDepth);
	}	

	return reader;
}

module.exports = StatusReader;
