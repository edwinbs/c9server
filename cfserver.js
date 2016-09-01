var compression = require('compression');
var express = require('express');
var http = require('http');
var cfenv = require('cfenv');
var bodyParser = require('body-parser');

var app = express();

app.use(compression());

// parse application/json
app.use(bodyParser.json());

app.use(express.static(__dirname + '/client'))
app.get('/', function(req, res) {
	res.sendFile(__dirname + '/client/html/index.html');
});

app.use(express.static(__dirname + '/management'));
app.get('/management', function(req, res) {
	res.sendFile(__dirname + '/management/index.html');
});

app.use(require('./controllers'));

var appEnv = cfenv.getAppEnv();

var server = http.createServer(app).listen(appEnv.port, function() {
	console.log("c9server starting on " + appEnv.url);
});

require('./server/mstsc')(server);
