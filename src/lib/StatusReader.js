var EventEmitter = require('events').EventEmitter;

var StatusReader = function(options) {
	var reader = new EventEmitter();
	var currTemp = 20;
	var currDepth = 0;
	
	reader.getStatus = function(callback){
		callback();
		setInterval(sendEvent,3000);
	}
	
	function sendEvent() {
		var status = { depth: updateDepth(), temp: updateTemp() };
		reader.emit('status', status);
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
