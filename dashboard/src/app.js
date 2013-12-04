var express = require('express')  
  , app = express()
  , server = app.listen(process.env.PORT)
  , io = require('socket.io').listen(server)
  , path = require('path')
  , fs=require('fs')
  , EventEmitter = require('events').EventEmitter
  , DashboardEngine = require('./lib/DashboardEngine-mock');


// Keep track of plugins js and css to load them in the view
var scripts = []
  , styles = []
  ;

app.configure( function() {
	app.use(express.static(__dirname + '/static/'));
	app.use(express.favicon());
	app.use(express.logger('dev'));
	app.use(app.router);

	app.set('port', process.env.PORT);
	app.set('views', __dirname + '/views');
	app.set('view engine', 'ejs', { pretty: true });
});

app.get('/', function (req, res) {
    res.render('index', {
        title: 'Express'
        ,scripts: scripts
        ,styles: styles
    });
});

var cockpit = {
	status : 'Unknown',
}

// no debug messages
io.configure(function(){ io.set('log level', 1); });

var dashboardEngine = new DashboardEngine();

var deps = {
    server: server
  , app: app
  , io: io
  , dashboardEngine: dashboardEngine
};

// Load the plugins
var dir = path.join(__dirname, 'plugins');
function getFilter(ext) {
    return function(filename) {
        return filename.match(new RegExp('\\.' + ext + '$', 'i'));
    };
}

fs.readdir(
	dir, 
	function (err, files) {
	    if (err) {
	        throw err;
	    }
	    files.filter(
	    	function (file) { return fs.statSync(path.join(dir,file)).isDirectory(); }
	    	)
	    .forEach(
	    	function (plugin) { 
	    		console.log("Loading " + plugin + " plugin.");
	    		// Load the backend code
	    		var pluginPath = path.join(dir, plugin);
	    		require(pluginPath)(plugin, deps);
	    		
  
      			// Add the public assets to a static route
      			assets = path.join(dir, plugin, 'public');
				if (fs.existsSync(assets)) {
					app.use("/plugin/" + plugin, express.static(assets));
				}
  
				// Add the js to the view
				if (fs.existsSync(js = path.join(assets, 'js'))) {
					fs.readdirSync(js)
						.filter(getFilter('js'))
						.forEach(
							function(script) {
								scripts.push("/plugin/" + plugin + "/js/" + script);
							});
				}

				// Add the css to the view
				if (fs.existsSync(css = path.join(assets, 'css'))) {
					fs.readdirSync(css)
						.filter(getFilter('css'))
						.forEach(
							function(style) {
								styles.push("/plugin/" + plugin + "/css/" + style);
							});
				}
    });
});


io.sockets.on('connection', function (socket) {

	// redirecting messages to socket-ios
	dashboardEngine.on('message', function(message){
		socket.emit(message.key, message.value);
	});

});

console.log('Started listening on port: ' + process.env.PORT);
