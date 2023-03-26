var express = require('express');

var router = express.Router();
//let rentalData = require('../../public/json/rentalData.json')
const RentalData = require("../../models/rentalData");





/* GET home page. */
router.get('/', async function(req, res, next) {

    let rentalData =  await RentalData.find({})
    console.log(`${rentalData} - rentalData`);
    setTimeout(() => {
        console.log('i ran');
    res.status(200).json(rentalData);
      }, 1000);
      
   
});


router.post("/sample", async (req, res, next) => {
    // create a new user from the query parameters

   
    let randomNumber = Math.random() * 1000000;
    await RentalData.create({
        stratifiedArea: `Alliston/Bradford ${randomNumber}`,
        municipality: `Bradford West`,
        streetNumber: 280,
        streetName: `MILLER PARK AVE`,
        housingType: `House`,
        unitSize: `2 Bedrooms`,
        secondarySuite: true,
        monthlyRent: 2300,
        utilitiesIncluded: true,
        landlordType: `Private`,
        stability: `Over 1 year`
      });

      let rentalData =  await RentalData.find({})
      console.log('i ran after posting');
      res.status(200).json(rentalData);
   

});

module.exports = router;