
var ArduinoPhysics = require('./ArduinoPhysics')
var os = require('./os-utils')

var CPUUsage =10;

var StatusReader = function() {

    var physics = new ArduinoPhysics();

    var reader = {};

	var currCpuUsage = 0;
	setInterval(function(){os.cpuUsage(function(v){currCpuUsage = v;});},1000);
    

    reader.parseStatus= function(rawStatus,controller){
        var parts = rawStatus.split(';');
        var status = {};

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
	
	if ('vout' in status) status.vout=parseFloat(status.vout);
	if ('iout' in status) status.iout=parseFloat(status.iout);
        
        if ('vout' in status) status.cpuUsage = currCpuUsage;
	if ('vout' in status) status.beagleFreeMem = os.freemem();
       
        return status;
    }
	
	return reader;
}

module.exports = StatusReader;
