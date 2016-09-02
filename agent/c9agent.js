

var net = require("net"), 
  http = require("http"),
  config = require("./config"),
  ioclient = require("socket.io-client"),
  bodyParser = require('body-parser'),
  express = require("express");

var app = express();

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/views'))

var httpserver;
function createServer() {
  httpserver = http.createServer(app); 
  httpserver.listen(config.localPort, config.localIP, function(err) {
    if (err) {
      console.log(err);
      console.log("Unable to setup listener on " + config.localPort + ". Exiting...");
      exit(1);
    }
    else {
      console.log("C9Agent listening on port " + config.localPort);
    }
  });
  httpserver.on("error", function(err) {
    console.log(err);
  });
}

createServer();

var impl;
var socket;

function initSocket() {
  impl = new net.Socket();

  impl.on('close', function(data) {
    socket.emit('rdpc-close', {data: data});
  }).on('connect', function(data) {
    socket.emit('rdpc-connection', {data: data});
  }).on('data', function(data) {
    socket.emit('rdpc-data', {data: data});
  }).on('drain', function(data) {
    socket.emit('rdpc-drain', {data: data});
  }).on('end', function(data) {
    socket.emit('rdpc-end', {data: data});
  }).on('error', function(data) {
    socket.emit('rdpc-error', {data: data});
  }).on('lookup', function(data) {
    socket.emit('rdpc-lookup', {data: data});
  }).on('timeout', function(data) {
    socket.emit('rdpc-timeout', {data: data});
  });

  socket.on('rdp-address', function() {
    impl.address();
  });

  socket.on('rdp-connect-1', function(data) {
    impl.connect(data.options, function() {
      socket.emit('rdpc-connect-callback-1');
    });
  });

  socket.on('rdp-connect-2', function(data) {
    impl.connect(data.port, data.host, function(err, data) {
      socket.emit('rdpc-connect-callback-2');
    });
  });

  socket.on('rdp-destroy', function(data) {
    impl.destroy(data.exception);
  });

  socket.on('rdp-end', function(data) {
    impl.end(data.data, data.encoding);
  });

  socket.on('rdp-pause', function(data) {
    impl.pause();
  });

  socket.on('rdp-ref', function(data) {
    impl.ref();
  });

  socket.on('rdp-resume', function(data) {
    impl.resume();
  });

  socket.on('rdp-setencoding', function(data) {
    impl.setEncoding(data.encoding);
  });

  socket.on('rdp-setkeepalive', function(data) {
    impl.setEncoding(data.enable, data.initialDelay);
  });

  socket.on('rdp-setnodelay', function(data) {
    impl.setNoDelay(data.noDelay);
  });

  socket.on('rdp-unref', function(data) {
    impl.unref();
  });

  socket.on('rdp-write', function(data) {
    impl.write(data.data, data.encoding, function() {
      socket.emit('rdpc-write-callback');
    });
  });
}

app.get("/", function(req, res) {
  res.sendFile(__dirname + '/views/login.html');
});

app.post("/validateSecret", function(req, res) {
  req.query = req.body;
  var c9server = req.query.c9server, secret = req.query.secret;
  socket = ioclient.connect('http://' + c9server, { query: "isAgent=true&agentToken="+ secret});
  socket.on('connect_error', function(err) {
    console.log("Connection to C9Server failed: " + err);
    res.end(JSON.stringify({err: "Invalid Server"}));
  });
  socket.on('connection_succeed', function() {
    console.log("Successfully connected to C9Server");
    initSocket();
    res.end(JSON.stringify({data: "Connected"}));
  });
  socket.on('connection_failed', function() {
    console.log("Invalid Secret Key");
    res.end(JSON.stringify({err: "Invalid Secret Key"}));
  });
  socket.on('error', function(err) {
  });

});

