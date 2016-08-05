var express = require('express');
var http = require('http');
var cfenv = require('cfenv');

var app = express();
app.use(express.static(__dirname + '/client'))
app.get('/', function(req, res) {
	res.sendFile(__dirname + '/client/html/index.html');
});

var appEnv = cfenv.getAppEnv();

var server = http.createServer(app).listen(appEnv.port, function() {
	console.log("c9server starting on " + appEnv.url);
});

require('./server/mstsc')(server);
