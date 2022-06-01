var express = require('express');
var router = express.Router();

let index = require('../controllers/index_controller')

// router.get('/', index.login);
// router.post('/auth', index.auth_index);
router.get('/', index.home);
router.get('/account', index.account);
router.get('/logout', index.destroyToken);

module.exports = router;