var express = require('express');
var router = express.Router();

router.use('/api/agents', require('./agents'));

module.exports = router;