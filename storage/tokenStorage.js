
/**
 *
 */

var tokenMap = {

};

var TokenStorage = {
	registerToken: function(token, ipRange, organization) {
		tokenMap[token] = {
			ipRange: ipRange,
			organization: organization
		};
	},

	getTunelConfigForToken: function(token) {
		return tokenMap[token];
	},

	getAll: function() {
	 	return tokenMap;
	}
}

module.exports = TokenStorage;