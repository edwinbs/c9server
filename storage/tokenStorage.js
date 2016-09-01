
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

	deleteConfigForToken: function(token) {
		if (!tokenMap[token]) {
			return false;
		}

		delete tokenMap[token];
		return true;
	},

	getTunelConfigForToken: function(token) {
		return tokenMap[token];
	},

	getAll: function() {
	 	return tokenMap;
	}
}

module.exports = TokenStorage;