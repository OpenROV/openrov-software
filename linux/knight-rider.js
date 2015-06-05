#!/usr/bin/env node
var fs = require('fs');
var ledState = [
	"0,0,0,0",
	"255,0,0,0",
	"255,255,0,0",
	"255,255,255,0",
	"255,255,255,255",
	"0,255,255,255",
	"0,0,255,255",
	"0,0,0,255",
	"0,0,0,0",
	"0,0,0,255",
	"0,0,255,255",
	"0,255,255,255",
	"255,255,255,255",
	"255,255,255,0",
	"255,255,0,0",
	"255,0,0,0",
	"0,0,0,0"
];

var leds;
if (fs.existsSync('/sys/class/leds/beaglebone:green:heartbeat/')){
   leds = [
        "/sys/class/leds/beaglebone:green:heartbeat/brightness",
        "/sys/class/leds/beaglebone:green:mmc0/brightness",
        "/sys/class/leds/beaglebone:green:usr2/brightness",
        "/sys/class/leds/beaglebone:green:usr3/brightness"
  ];
} else {
   leds = [
        "/sys/class/leds/beaglebone:green:usr0/brightness",
        "/sys/class/leds/beaglebone:green:usr1/brightness",
        "/sys/class/leds/beaglebone:green:usr2/brightness",
        "/sys/class/leds/beaglebone:green:usr3/brightness"
  ];
}

var patternIndex = 0;
var buffer0 = new Buffer('0');
var buffer255 = new Buffer('255');
var fds = [];
for(var led = 0; led < leds.length; led++) {
	fds[led] = fs.openSync(leds[led], 'r+');
}
var int = setInterval(
	function() {
		var pattern = ledState[patternIndex].split(',');
		for (var i = 0; i < 4; i++) {
			fs.writeSync(fds[i], pattern[i] == '0' ? buffer0 : buffer255, 0, pattern[i].length,0);
		}

		patternIndex = patternIndex + 1;
		if (patternIndex == ledState.length) {
			patternIndex = 0;
		}
	},
	200
	);
process.on('SIGTERM', function () {
	console.error('got SIGTERM, shutting down...');
 	clearInterval(int);
	closeLeds();
});
process.on('SIGINT', function () {
	console.error('got SIGINT, shutting down...');
 	clearInterval(int);
	closeLeds();
});

function closeLeds() {
	for(var led = 0; led < leds.length; led++) {
		fs.closeSync(fds[led]);
	}

};
