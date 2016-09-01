'use strict';

var inherits = require('util').inherits;
var events = require('events');
var net = require('net');

var netbuffer = require('./netbuffer');

function NetworkProxy(tunnel) {
	console.log('Using network proxy');

	this.bufferLayer = new netbuffer.BufferLayer(new net.Socket());
	var self = this;
	this.bufferLayer.on('data', function(s) {
		self.emit('data', s);
	}).on('close', function() {
		self.emit('close');
	}).on('error', function(err) {
		self.emit('error', err);
	});
}

inherits(NetworkProxy, events.EventEmitter);

NetworkProxy.prototype.recv = function(data) {
	console.log('[proxy] recv()');
	return this.bufferLayer.recv(data);
}

NetworkProxy.prototype.send = function(data) {
	console.log('[proxy] send()');
	return this.bufferLayer.send(data);
}

NetworkProxy.prototype.connect = function(port, host, callback) {
	console.log('[proxy] connect()');
	return this.bufferLayer.socket.connect(port, host, callback);
}

NetworkProxy.prototype.expect = function(expectedSize) {
	console.log('[proxy] expect()');
	return this.bufferLayer.expect(expectedSize);
}

NetworkProxy.prototype.startTLS = function(callback) {
	console.log('[proxy] startTLS()');
	return this.bufferLayer.startTLS(callback);
}

NetworkProxy.prototype.listenTLS = function(keyFilePath, crtFilePath, callback) {
	console.log('[proxy] listenTLS()');
	return this.bufferLayer.listenTLS(keyFilePath, crtFilePath, callback);
}

NetworkProxy.prototype.close = function() {
	console.log('[proxy] close()');
	return this.bufferLayer.close();
}

module.exports = {
	BufferLayer: NetworkProxy
};
