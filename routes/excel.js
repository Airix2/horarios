var express = require('express');
var router = express.Router();

let index = require('../controllers/excel_controller')

// TESTING
router.get('/getExcel', index.renderExcel);
router.post('/showExcel', index.showExcel);

module.exports = router;