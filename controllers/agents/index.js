var express = require('express');
var TokenStorage = require('../../storage/tokenStorage');
var TunnelStorage = require('../../storage/tunnelStorage');

var router = express.Router();

router.post('/', function(req, res, next) {
	var ipRange = req.body.ipRange;
	var organization = req.body.organization;
	var token = Math.floor((Math.random() * 100000000) + 1);

	TokenStorage.registerToken(token, ipRange, organization);
	res.status(200).json({token: token});
});

router.get('/', function(req, res) {
	res.status(200).json(TokenStorage.getAll());
});

router.get('/:token', function(req, res) {
	var config = TokenStorage.getTunelConfigForToken(req.params.token);
	if (config) {
		res.status(200).json(config);
	} else {
		res.status(400).json({err: "Token not registered"});
	}
});

router.delete('/:token', function(req, res) {
	var config = TokenStorage.getTunelConfigForToken(req.params.token);
	if (TokenStorage.deleteConfigForToken(req.params.token)) {
		TunnelStorage.removeTunnel(config.organization, config.ipRange);
		res.status(200).end();
	} else {
		res.status(400).json({error: 'tokenNotExist'});
	}
});

module.exports = router