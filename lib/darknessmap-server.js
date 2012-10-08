/*
 * darknessmap-server
 * https://github.com/goliatone/darknessmap-server
 *
 * Copyright (c) 2012 goliatone
 * Licensed under the MIT license.
 */

exports.awesome = function() {
  return 'awesome';
};

var express = require('express'),
	sio = require('socket.io');

/*
var app = function(){};
*/
var app = express.createServer(
		express.bodyParser(),
		express.static('public')
	);

app.listen(3000);

// exports.app = new app();


var io = sio.listen(app);

io.socket.on('connection',function(socket){
	console.log('socket connection got client');
});


/**
 * Create Flash Policy Server.
 * We use the standard port, 843.
 */
var pf = require('policyfile').createServer();

pf.listen(2424, function(){
  console.log('FlashPolicyServer...');
});

pf.socket.on('connect',function(){
	console.log('on connect');
});
pf.socket.on('data',function(){
	console.log('data');
});