var EventEmitter = require('events').EventEmitter;

function SoftwareMock(){
	software = new EventEmitter();

	var express = require('express')
	  , app = express()
	  , server = app.listen(process.env.PORT)
	  , io = require('socket.io').listen(server)
	  , EventEmitter = require('events').EventEmitter;


	return software;
}