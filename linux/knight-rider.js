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

var leds = [
	"/sys/class/leds/beaglebone:green:heartbeat/brightness",
	"/sys/class/leds/beaglebone:green:mmc0/brightness",
	"/sys/class/leds/beaglebone:green:usr2/brightness",
	"/sys/class/leds/beaglebone:green:usr3/brightness"
];
var patternIndex = 0;
setInterval(
	function() {
		var pattern = ledState[patternIndex].split(',');
		for (var i = 0; i < 4; i++) {
			//console.log('led: ' + leds[i] + ' ' + pattern[i]);
			fs.writeFile(leds[i], pattern[i], function(err) {});
		}

		patternIndex = patternIndex + 1;
		if (patternIndex == ledState.length) {
			patternIndex = 0;
		}
	},
	90
	);
