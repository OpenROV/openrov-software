
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
    

    reader.parseStatus= function(rawStatus,controller){
        var parts = rawStatus.split(';');
        var status = { depth: updateDepth(), temp: updateTemp()};

        for(var i=0;i<parts.length;i++){
            var subParts = parts[i].split(":");
	    switch (subParts[0]) {
	    case '*settings':
		console.log(subParts[1]);
		var setparts = subParts[1].split(",");
		var settingsCollection = {};
		for (var s=0;s<setparts.length;s++) {
		    var lastParts = setparts[s].split("|");
		    settingsCollection[lastParts[0]] = lastParts[1];
		}
		controller.emit('Arduino-settings-reported',settingsCollection)
		break;
	    default:
		status[subParts[0]]=subParts[1];

	    }            
        }
	
	if ('vout' in status) status.vout=physics.mapVoltageReading(status.vout);
	if ('iout' in status) status.iout=physics.mapCurrentReading(status.iout);
        
        if ('vout' in status) status.cpuUsage = currCpuUsage;
       
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
