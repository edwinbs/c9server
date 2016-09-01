/*
 * Copyright (c) 2015 Sylvain Peyrefitte
 *
 * This file is part of mstsc.js.
 *
 * mstsc.js is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */

var rdp = require('../rdp/rdp');
var TokenStorage = require('../storage/tokenStorage');

var tunnels = {};
var tunnelsById = {};

function getTunnel(organization, ip) {
	if (!organization || !ip || !tunnels[organization]) {
		console.log('Tunnel not found');
		return null;
	}

	var orgTunnels = tunnels[organization];
	for (var key in orgTunnels) {
		if (orgTunnels.hasOwnProperty(key)) {
			if (ip.indexOf(key.substring(0, key.indexOf('*'))) === 0) {
				console.log('Tunnel for ' + organization + ' with ip range ' + key + ' found');
				return orgTunnels[key];
			}
		}
	}

	console.log('Tunnel not found');
	return null;
}

/**
 * Create proxy between rdp layer and socket io
 * @param server {http(s).Server} http server
 */
module.exports = function (server) {
	var io = require('socket.io')(server);
	io.on('connection', function(client) {
		if (client.handshake.query.isAgent == "true") {
			var tunnelId = client.id;
			var agentToken = client.handshake.query.agentToken;

			var tunnelConfig = TokenStorage.getTunelConfigForToken(agentToken);
			if (!tunnelConfig || !tunnelConfig.organization || !tunnelConfig.ipRange) {
				client.emit('connection_failed', 'Token not registered');
				console.log('[agent_connect] Token not registered');
			} else {
				if (!tunnels[tunnelConfig.organization]) {
					tunnels[tunnelConfig.organization] = {};
				}

				var existingTunnel = tunnels[tunnelConfig.organization][tunnelConfig.ipRange];
				if (existingTunnel) {
					existingTunnel.disconnect();
				}

				tunnels[tunnelConfig.organization][tunnelConfig.ipRange] = client;

				client.emit('connection_succeed');
				console.log('[agent_connect] Tunnel for ' + tunnelConfig.organization + ' with ip range ' + tunnelConfig.ipRange + ' connected');

				client.on('disconnect', function() {
					var curTunnel = tunnels[tunnelConfig.organization][tunnelConfig.ipRange];
					if (curTunnel.id === tunnelId) {
						console.log('[agent_disconnect] Removed tunnel record for ' + tunnelConfig.organization + ' with ip range ' + tunnelConfig.ipRange);
						tunnels[tunnelConfig.organization][tunnelConfig.ipRange] = null;
					}
				});
			}
		} else {
			var rdpClient = null;
			client.on('infos', function (infos) {
				if (rdpClient) {
					// clean older connection
					rdpClient.close();
				};

				var tunnel = getTunnel(infos.organization, infos.ip);
				console.log('[main] tunnel=' + tunnel);
				
				rdpClient = rdp.createClient({
					tunnel : tunnel,
					domain : infos.domain, 
					userName : infos.username,
					password : infos.password,
					enablePerf : true,
					autoLogin : true,
					screen : infos.screen,
					locale : infos.locale,
					logLevel : process.argv[2] || 'INFO'
				}).on('connect', function () {
					client.emit('rdp-connect');
				}).on('bitmap', function(bitmap) {
					client.emit('rdp-bitmap', bitmap);
				}).on('close', function() {
					client.emit('rdp-close');
				}).on('error', function(err) {
					client.emit('rdp-error', err);
				}).connect(infos.ip, infos.port);
			}).on('mouse', function (x, y, button, isPressed) {
				if (!rdpClient)  return;

				rdpClient.sendPointerEvent(x, y, button, isPressed);
			}).on('wheel', function (x, y, step, isNegative, isHorizontal) {
				if (!rdpClient) {
					return;
				}
				rdpClient.sendWheelEvent(x, y, step, isNegative, isHorizontal);
			}).on('scancode', function (code, isPressed) {
				if (!rdpClient) return;

				rdpClient.sendKeyEventScancode(code, isPressed);
			}).on('unicode', function (code, isPressed) {
				if (!rdpClient) return;

				rdpClient.sendKeyEventUnicode(code, isPressed);
			}).on('disconnect', function() {
				if(!rdpClient) return;

				rdpClient.close();
			});
		}
	});
}