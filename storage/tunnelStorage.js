
/**
 *
 */

var tunnels = {};

var TunnelStorage = {
	findTunnel: function(organization, ip) {
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
	},

	addTunnel: function(organization, ipRange, client) {
		if (!tunnels[organization]) {
			tunnels[organization] = {};
		}

		var existingTunnel = tunnels[organization][ipRange];
		if (existingTunnel) {
			existingTunnel.disconnect();
		}

		tunnels[organization][ipRange] = client;
	},

	getTunnel: function(organization, ipRange) {
		return tunnels[organization][ipRange];
	},

	removeTunnel: function(organization, ipRange) {
		if (tunnels[organization] && tunnels[organization][ipRange]) {
			tunnels[organization][ipRange].emit('rdp-destroy', {exception: null});
			tunnels[organization][ipRange].disconnect();
		}

		delete tunnels[organization][ipRange];
	}
}

module.exports = TunnelStorage;