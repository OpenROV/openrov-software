>The plugin architecure for OpenROV are the conventions used to extend how the the rov and its software behave. 

##Goals for plugins:

1. **Isolate all functions to encourage hacking.** Community members will take more risks and make more amazing things if area's they want to improve such as how lights work won't impact areas they may be less comfortable with such as motor control.
2. **Have a single plugin module that cuts across all layers of the ROV architecture** as needed that can be versioned and deployed as a single package.
3. **Keep each layer of the plugins as native to that layer of the ROV architecture as possible.**  A plugin system that takes a lot of memory but is well abstracted at the browser level would probably be a disaster in the memory constrained, embedded program feel of the Arduino.
4. **Allow the community to make plugins available without having to submit them to OpenROV** to encourage the development of new and conflicting ideas of how ROVs operate, and to open the door for other ROV projects to adopt all or part of what the OpenROV community has developed in their projects.  

##Approach:

I would like to call out Laurent Eschenauer and his [ardrone-webflight](https://github.com/eschnou/ardrone-webflight) project that so heavily inspired the javascript and node plugin solution.  If you are using ardrone you should check it out. 

###Plugin Package
The plugins are directory based and intended to be listed and managed using twitter's bowser web package manager.  

- PluginName\
	- bower.json (bower.io metadata about plugin)
	- index.js (node.js plugin)
	- public\
		- css\
			- PluginName.css
		- js\
			- PluginName.js (browser plugin)
	- microcontroller\
		- PluginName.h
		- PluginName.cpp (Arduino plugin)
		- Supportfiles.h
		- Supportfiles.cpp

###Browser Plugin
The browser plugin is a two part plug-in.  The node.js process uses a templating engine to crawl the plugin directory and find all of the plugins.  It then inserts scripts tags for the .js files and tags for the .css files in to the page being loaded.  
The .js files that are loaded have a convention where they register themselves as javascript functions in a global `plugin[]` variable. The plugin's are activated by a loop in the browser javascript code that instantiates each item in the global `plugin[]` variable.

###Node.js Plugin
When the node.js process starts, it crawls the configured plugin directly for index.js files in each folder it fines. Is then simply loads the .js file.  

###Arduino Plugin
The firmware-install shell script copies the base source code to a temporary folder. It then crawls the plugin folder for the Arduino code, copies that code in to the same temporary folder and then injects code to register the plugin in to the plugins.cpp file which get statically linked during the compile process.  Each plugin has a convention based on deriving from the device class.  Any device class simply extends the hooks Arduino programs typically use, so it exposes a device_loop() and device_setup() method.  