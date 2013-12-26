var EventEmitter = require('events').EventEmitter
  , cp = require('child_process')
  , Lazy = require('lazy');

var Dpkg = function() {
	var dpkg = { };

	dpkg.packages = function() {
		var dpkgProcess = cp.spawn('dpkg', ['-l', 'openrov-*']);

		var result = [ ];	    
	    return Lazy(dpkgProcess.stdout)
	        .lines
	        .map(String)
	        .skip(5) // skips the 5 lines that are the dpkg header
	        .filter(function(line){
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