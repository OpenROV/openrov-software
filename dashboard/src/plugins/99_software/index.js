var dpkg = require("../../lib/dpkg")
  , Sync = require('sync');


function software(name, deps) {

	var packages = { };
	function packageJoin(callback) {
		packages.join(function(items){
			callback(null, items);
		});
	}

	deps.app
		.get('/softwarepackages', 
			function(req, res) {
				packages = new dpkg().packages();		
			    res.send(packageJoin.sync(null));
	    		return true;
	    	}
	    	.asyncMiddleware());
};

module.exports = software;