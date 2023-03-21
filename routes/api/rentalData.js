var express = require('express');
var router = express.Router();
let rentalData = require('../../public/json/rentalData.json')





/* GET home page. */
router.get('/', function(req, res, next) {
 
    setTimeout(() => {
        console.log('i ran');
    res.status(200).json(rentalData);
      }, 1000);
      
   
});

module.exports = router;