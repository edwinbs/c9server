'use strict';

var inherits = require('util').inherits;
var net = require('net');
var events = require('events');

function NetProxy(tunnel) {
	this.tunnel = tunnel;
	var self = this;
	this.tunnel.on('rdpc-close', function(data) {
		self.emit('close', data.data);
	}).on('rdpc-connect', function(data) {
		self.emit('connection', data.data);
	}).on('rdpc-data', function(data) {
		self.emit('data', data.data);
	}).on('rdpc-drain', function(data) {
		self.emit('drain', data.data);
	}).on('rdpc-end', function(data) {
		self.emit('end', data.data);
	}).on('rdpc-error', function(data) {
		self.emit('error', data.data);
	}).on('rdpc-lookup', function(data) {
		self.emit('lookup', data.data);
	}).on('rdpc-timeout', function(data) {
		self.emit('timeout', data.data);
	});
}

inherits(NetProxy, events.EventEmitter);

NetProxy.prototype.address = function() {
	this.tunnel.emit('rdp-address');
};

NetProxy.prototype.connect = function(options, connectListener) {
	this.tunnel.on('rdpc-connect-callback-1', function() {
		connectListener();
	});
	this.tunnel.emit('rdp-connect-1', {options: options});
};

NetProxy.prototype.connect = function(port, host, connectListener) {
	this.tunnel.on('rdpc-connect-callback-2', function() {
		connectListener();
	});
	this.tunnel.emit('rdp-connect-2', {port: port, host: host});
};

NetProxy.prototype.destroy = function(exception) {
	this.tunnel.emit('rdp-destroy', {exception: exception});
};

NetProxy.prototype.end = function(data, encoding) {
	this.tunnel.emit('rdp-end', {data: data, encoding: encoding});
};

NetProxy.prototype.pause = function() {
	this.tunnel.emit('rdp-pause');
};

NetProxy.prototype.ref = function() {
	this.tunnel.emit('rdp-ref');
};

NetProxy.prototype.resume = function() {
	this.tunnel.emit('rdp-resume');
};

NetProxy.prototype.setEncoding = function(encoding) {
	this.tunnel.emit('rdp-setencoding', {encoding: encoding});
};

NetProxy.prototype.setKeepAlive = function(enable, initialDelay) {
	this.tunnel.emit('rdp-setkeepalive', {enable: enable, initialDelay: initialDelay});
};

NetProxy.prototype.setNoDelay = function(noDelay) {
	this.tunnel.emit('rdp-setnodelay', {noDelay: noDelay});
};
/*
NetProxy.prototype.setTimeout = function(timeout, callback) {
	this.impl.setTimeout(timeout, callback);
};
*/
NetProxy.prototype.unref = function() {
	this.tunnel.emit('rdp-unref');
};

NetProxy.prototype.write = function(data, encoding, callback) {
	this.tunnel.on('rdpc-write-callback', function() {
		if (callback) callback();
	});
	this.tunnel.emit('rdp-write', {data: data, encoding: encoding});
};

NetProxy.prototype.pipe = function(socket) {
	this.tunnel.on('rdpc-data', function(data) {
		socket.write(data.data);
	});
	this.tunnel.on('rdpc-end', socket.end);
};

module.exports = {
	Socket : NetProxy
};
