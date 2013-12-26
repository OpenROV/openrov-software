var EventEmitter = require('events').EventEmitter
  , cp = require('child_process')
  , Lazy = require('lazy');

var dpkgOutput = "Desired=Unknown/Install/Remove/Purge/Hold\n| Status=Not/Inst/Conf-files/Unpacked/halF-conf/Half-inst/trig-aWait/Trig-pend\n|/ Err?=(none)/Reinst-required (Status,Err: uppercase=bad)\n||/ Name                               Version                Architecture           Description\n+++-==================================-======================-======================-=========================================================================\nii  openrov-avrdude                    6.0.1-1                armhf                  OpenROV avrdude package\nii  openrov-cloud9                     0.7.0-2                armhf                  OpenROV Cloud9 IDE package\nii  openrov-cockpit                    2.5.0-6                armhf                  OpenROV Cockpit and Dashboard\nii  openrov-dtc                        1.4-1                  armhf                  OpenROV dtc (device tree compiler)\nii  openrov-emmc-copy                  0.1-0                  armhf                  Package to copy the content of the image to the bbb eMMC\nii  openrov-image                      2.5-6                  armhf                  Package to provide version information about what OpennROV image we're on\nii  openrov-ino                        0.3.6-1                armhf                  OpenROV ino package\nii  openrov-mjpeg-streamer             2.0-1                  armhf                  OpenROV mjpg-streamer package.\nii  openrov-nodejs                     0.10.17-1              armhf                  OpenROV NodeJS package\nii  openrov-samba-config               0.1-1                  armhf                  OpeROV Samba configuration package\n";

var Dpkg = function() {
	var dpkg = { };

	dpkg.packages = function() {
		//var dpkgProcess = cp.spawn('echo', [dpkgOutput]);
		var dpkgProcess = cp.spawn('dpkg', ['-l', 'xul*']);
		var result = [ ];	    
	    return Lazy(dpkgProcess.stdout)
	        .lines
	        .map(String)
	        .skip(5) // skips the 5 lines that are the dpkg header
	        .filter(function(line){
	        	//console.log("FILTER " + line);
	        	return line !== "0";
	        })
	        .map(function (line) {
	            var fields = line.trim().split(/\s+/, 3);
	            return {
		            package : fields[1],
		            version : fields[2]
				};
	        })
	};
	return dpkg;
}

module.exports = Dpkg;