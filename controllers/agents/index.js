var express = require('express');
var TokenStorage = require('../../storage/tokenStorage');

var router = express.Router();

router.post('/', function(req, res, next) {
	var ipRange = req.body.ipRange;
	var organization = req.body.organization;
	var token = Math.floor((Math.random() * 100000000) + 1);

	TokenStorage.registerToken(token, ipRange, organization);
	res.status(200).send({token: token});
});

router.get('/', function(req, res) {
	res.status(200).send(TokenStorage.getAll());
});

router.get('/:token', function(req, res) {
	var config = TokenStorage.getTunelConfigForToken(req.params.token);
	if (config) {
		res.status(200).send(config);
	} else {
		res.status(400).send({err: "Token not registered"});
	}
});

module.exports = router