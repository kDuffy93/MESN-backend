var express = require('express');
var router = express.Router();
let rentalData = require('../../public/json/rentalData.json')





/* GET home page. */
router.get('/', function(req, res, next) {
    console.log('i ran');
    res.status(200).json(rentalData);
});

module.exports = router;