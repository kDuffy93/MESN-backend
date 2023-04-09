var express = require("express");
//for scraping SPA's
const puppeteer = require("puppeteer");
//for scraping SSR sites
const axios = require("axios");
const cheerio = require("cheerio");

const AWS = require('aws-sdk');

const s3 = new AWS.S3({
  accessKeyId: "AKIASWDEI5KKSVZIYCST",
  secretAccessKey: "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",
});

const BUCKET = 'ahcl-screenshots';

const uploadFile = (filePath, keyName) => {
  return new Promise((resolve, reject) => {
    try {
      var fs = require('fs');
      const file = fs.readFileSync(filePath);
      const BUCKET = 'ahcl-screenshots';

      const uploadParams = {
        Bucket: BUCKET,
        Key: keyName,
        Body: file
      };

      s3.upload(uploadParams, function (err, data) {
        if (err) {
          return reject(err);
        }
        if (data) {
          return resolve(data);
        }
      });
    } catch (err) {
      return reject(err);
    }
  })
};
//how to upload
//call('filepath','key');
//uploadFile('C:/Users/kyled/Documents/Waverly Menu/menuFiles/Assets/menuBackground.jpg', 'menuBackground.jpg');
//how to get




var router = express.Router();
//let rentalData = require('../../public/json/rentalData.json')
const RentalData = require("../../models/rentalData");
const HousingType = require("../../models/housingType");
const Municipality = require("../../models/municipality");
const StratifiedArea = require("../../models/stratifiedArea");
const UnitSize = require("../../models/unitSize");
const AgSecureListings = require("../../models/agSecureListings");
const { error } = require("console");

/* GET home page. */
router.get("/", async function (req, res, next) {



  var list = [];

  let agrentalData = await AgSecureListings.find({});

  for (const listing of agrentalData) {
    let tempObj = {
      "Collected From": listing.source,
      "address": listing.location.address,
      "Geo-location": listing.location.geolocation,
      "No. of Bedrooms": listing.bedrooms,
      "Rent": listing.rent,
      "Payment Period": listing.rentFrequency,
      "Unit Size": listing.unitSize,
      "Description": listing.description,
      "utilities Included": listing.utilities.included,
      "utilities Extra": listing.utilities.additional,
      "avaibility": listing.avaibility
    }










    await list.push(JSON.stringify(tempObj));
  }
  console.log(list)
  var uniqueListSet = new Set(list);
  console.log(uniqueListSet);

  var uniqueListObj = JSON.parse(JSON.stringify(Array.from(uniqueListSet)));

  //console.log(uniqueListObj);
  res.status(200).json(uniqueListObj);

  /* setTimeout(() => {
    console.log("i ran"); console.log({ ...rentalDataSet });
    
  }, 1000); */
});

router.post("/sample", async (req, res, next) => {
  // create a new user from the query parameters
  /* let randomNumber = Math.random() * 1000000;
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
    stability: `Over 1 year`,
  });
  let rentalData = await RentalData.find({});
  //console.log("i ran after posting");
  res.status(200).json(rentalData); */
  //console.log("i ran after posting at sample");
  getAGSecureData();
});

let getAGSecureData = async () => {
  let baseURL = "https://www.agsecure.ca";
  const cities = [
    { name: "Alliston", municipality: "New Tecumseth", stratified_area: "Alliston/Breadford" },
    { name: "Angus", municipality: "Essa", stratified_area: "Barrie" },
    { name: "Barrie", municipality: "Barrie", stratified_area: "Barrie" },
    { name: "Bradford", municipality: "bradford West Gwillimbury", stratified_area: "Alliston/Breadford" },
    { name: "Collingwood", municipality: "Collingwood", stratified_area: "Collingwood" },
    { name: "Friday Harbour", municipality: "Innisfil", stratified_area: "Barrie" },
    { name: "Innisfil", municipality: "Innisfil", stratified_area: "Barrie" },
    { name: "Midland", municipality: "Midland", stratified_area: "Midland" },
    { name: "Orillia", municipality: "Orillia", stratified_area: "Orillia" },
    { name: "Tottenham", municipality: "New Tecumseth", stratified_area: "Alliston/Breadford" },
    { name: "Wasaga", municipality: "Wasage Beach", stratified_area: "Collingwood" },
  ];

  console.log(`fetching data for all the cities... please wait...`);
  for (const city of cities) {
    const url = `https://www.agsecure.ca/listings/${city.name}/`;
    await agSecureFetch1(url, baseURL, city);
  }


  console.log(`DONE - fetching data for all the cities...`);
  console.log(`fetching Secondary data for all new OBJS`);

  for (const id of objectIds) {
    let tempObj = await AgSecureListings.findById(id);
    //perform another fertch on full listing and grab the rest of the data
    try {
      await agSecureFetch2(tempObj.listingURL, tempObj._id);
    } catch (error) {
      console.error(error);
      // Expected output: ReferenceError: nonExistentFunction is not defined
      // (Note: the exact output may be browser-dependent)
    }


  }


  console.log(`DONE - fetching Secondary data for all new OBJS`);
};
let objectIds = [];

let agSecureFetch1 = async (url, baseUrl, city) => {
  try {
    const response = await axios.get(url);
    ////console.log(response);
    const $ = cheerio.load(response.data);
    ////console.log($);
    const noOfProperties = $(".listing");
    //console.log(`${noOfProperties.length} are open for rent in ${city.name} in ${city.municipality} in ${city.stratified_area} on ${url}`);

    for (let i = 0; i < noOfProperties.length; i++) {
      let priceSpan = $(noOfProperties[i].children[3].children[3]).text();
      indexOfDollarSign = priceSpan.indexOf("$");
      let indexOfFirstSpace = priceSpan.indexOf(" ");
      indexOfPer = priceSpan.indexOf("per ");

      let priceDollars = priceSpan.slice(
        indexOfDollarSign + 1,
        indexOfFirstSpace
      );
      let period = priceSpan.slice(indexOfPer + 4);
      let address = $(noOfProperties[i].children[3].children[1].children[0]).text();
      address = address.trim();
      let unitSize = $(noOfProperties[i].children[3].children[9].children).text();
      unitSize = unitSize.replace(/\s+/g, ' ').replace(' READ MORE', '').trim();
      let pttrn = /^\s*/;
      let spacesBeforeText = String(unitSize).match(pttrn)[0].length;
      let numberOfBedrooms = unitSize.slice(spacesBeforeText, spacesBeforeText + 1);
      numberOfBedrooms = (numberOfBedrooms === 'b' || numberOfBedrooms === 'B') ? 1 : numberOfBedrooms;
      let adLink = `${baseUrl}${$(noOfProperties[i].children[3].children[9].children[3].children[0]).attr("href")}`;


      //console.log(`numberOfBedrooms: ${numberOfBedrooms}`);
      //console.log(`unitSize: ${unitSize} `);
      //console.log(address);
      //console.log(`price: ${priceDollars}`);
      //console.log(`period ${period}`);
      //console.log(`adLink  ${adLink}`);

      // populate object from noOfProperties[i]
      let tempObject = {
        source: `${baseUrl}`,
        listingURL: `${adLink}`,
        dateCollected: Date.now(),
        location: {
          stratifiedArea: `${city.stratified_area}`,
          municipality: `${city.municipality}`,
          address: `${address}`,
          geolocation: `44.3894,-79.6903`, // in 3rd script of map = start_lat / start_long // from 2nd listing page
        },
        bedrooms: `${numberOfBedrooms}`,
        rent: `${priceDollars}`,
        rentFrequency: `${period}`,
        unitSize: `${unitSize}`,
        description: ``, // from 2nd listing page
        utilities: { // from 2nd listing page
          included: `${true}`,// from 2nd listing page
          additional: [],// from 2nd listing page
        },
        avaibility: `${''}`,// from 2nd listing page
        screenshot: ``, // puppeteer or ?
      };
      // create a new database record
      // let tempDBoBJ = await AgSecureListings.create(tempObject);

      // this is where we should check if this listing already exists in the databse, and if it does update that record instead of creating 
      //a new one and return that objects id to the objectId array instead of a new object for it to check it listing page to also update the secondary columns
      try {
        let tempFetch = await AgSecureListings.findOne({ 'location.address': address });
        if (tempFetch.length > 0) {
          await AgSecureListings.findByIdAndUpdate(tempFetch._id, tempObject);
          objectIds = [tempFetch._id, ...objectIds];
        }
        else {
          return error;
        }
      }
      catch {
        let tempDBoBJ = await new AgSecureListings(tempObject).save();
        objectIds = [tempDBoBJ._id, ...objectIds];
      }




    }
    //console.log(objectIds.length);
    // loop through object IDS and do a model lookup based on that id. then find the corresponding listingURL 
    // from the object and perform another fetch to fill in the rest of the data on the correct object


  } catch (e) {
    console.error(`Error while fetching rental properties for ${city} on ${url}`);
    console.error(e);
  }
};

let agSecureFetch2 = async (url, id) => {
  //function level consts
  const response = await axios.get(url);
  const $ = cheerio.load(response.data);
  const listingLeft = $(".listing-left");
  const listingMaps = $(".listing-map");

  //function level vars
  let description;
  let avaibility;
  let UtilitiesIncluded;
  let AdditionalUtilities = [];
  let lat;
  let long;

  // to get geolocation
  for (let i = 0; i < listingMaps.length; i++) {
    let listingMapScripts = $(listingMaps[i]).children('script');
    let scriptText = $(listingMapScripts[2]).html();
    let indexOfLatStart = scriptText.indexOf('var start_lat = ');
    let indexOfLatEnd = scriptText.indexOf(';', indexOfLatStart);
    let indexOfLongStart = scriptText.indexOf('var start_long = ');
    let indexOfLongEnd = scriptText.indexOf(';', indexOfLongStart);
    lat = scriptText.slice(indexOfLatStart + 16, indexOfLatEnd);
    long = scriptText.slice(indexOfLongStart + 17, indexOfLongEnd);
  }



  for (let i = 0; i < listingLeft.length; i++) {
    // to get description
    let listingDescription = String($(listingLeft[i]).text());
    description = listingDescription;
    description = description.replace(/\s+/g, ' ').trim();
    //Availability
    let indexOfAvailable = listingDescription.indexOf(`Available`);
    let indexOfAvailableEnd = listingDescription.indexOf(`\n`, indexOfAvailable + 10);
    avaibility = listingDescription.slice(indexOfAvailable + 10, indexOfAvailableEnd).replace(/^\s+|\s+$/g, '');
    avaibility == '' ? avaibility = 'Unknown' : avaibility;

    //utilities Included?
    let indexOfUtilitiesIncluded = listingDescription.indexOf(`Utilities Included`);
    UtilitiesIncluded = indexOfUtilitiesIncluded == -1 ? false : true;

    //utilities Additional   additional
    let indexOfPlusHeat = listingDescription.indexOf(`Plus Heat`);
    let indexOfPlusWater = listingDescription.indexOf(`Plus Water`);
    let indexOfPlusHydro = listingDescription.indexOf(`Plus Hydro`);
    indexOfPlusHeat == -1 ? AdditionalUtilities.push('Plus Heat') : null;
    indexOfPlusWater == -1 ? AdditionalUtilities.push('Plus Water') : null;
    indexOfPlusHydro == -1 ? AdditionalUtilities.push('Plus Hydro') : null;
  }

  // get & update db object 
  await AgSecureListings.findById(id).then((dbObj) => {
    dbObj.location.geolocation = `${lat == "" ? lat = "0" : lat},${long == "" ? long = "0" : long}`; // in 3rd script of map = start_lat / start_long // from 2nd listing page

    dbObj.description = description.replace(dbObj.unitSize, '').replace('EMAIL US TENANT APPLICATION', ''); // from 2nd listing page
    //cleaning the description of extra stuff 
    let indexOfRent = dbObj.description.indexOf('Rent $');
    dbObj.description = dbObj.description.slice(0, indexOfRent == -1 ? dbObj.description.length : indexOfRent);
    let indexOfRent2 = dbObj.description.indexOf('Rent:');
    dbObj.description = dbObj.description.slice(0, indexOfRent2 == -1 ? dbObj.description.length : indexOfRent2);
    let indexOfIfInterested = dbObj.description.indexOf('IF INTERESTED PLEASE SEND US AN EMAIL AT');
    dbObj.description = dbObj.description.slice(0, indexOfIfInterested == -1 ? dbObj.description.length : indexOfIfInterested);
    let indexOfAvailable = dbObj.description.indexOf(`Available`);
    dbObj.description = dbObj.description.slice(0, indexOfAvailable == -1 ? dbObj.description.length : indexOfAvailable);
    let indexOfAvailable2 = dbObj.description.indexOf(`Available:`);
    dbObj.description = dbObj.description.slice(0, indexOfAvailable2 == -1 ? dbObj.description.length : indexOfAvailable2);

    dbObj.utilities.included = UtilitiesIncluded;  // from 2nd listing page
    dbObj.utilities.additional = AdditionalUtilities;  // from 2nd listing page
    dbObj.avaibility = String(avaibility);// from 2nd listing page
    dbObj.screenshot = `https://ahcl-screenshots.s3.us-east-2.amazonaws.com/menuBackground.jpg`; // puppeteer or ?
    return dbObj;
  })
    .then(async (dbObj) => {
      await AgSecureListings.findByIdAndUpdate(id, dbObj);
      //console.log(await AgSecureListings.findById(dbObj.id));
    });
};

module.exports = router;

/* 

sample axios + cheerio call >

(async () => {
  const args = process.argv.slice(2);
  const postCode = args[0] || 2000;
  const url = `https://www.domain.com.au/rent/?postcode=${postCode}&excludedeposittaken=1`;
  try {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);
    const noOfProperties = $('h1>strong').text();
    //console.log(`${noOfProperties} are open for rent in ${postCode} postcode of Australia on Domain`);
  } catch (e) {
    console.error(`Error while fetching rental properties for ${postCode} - ${e.message}`);
  }
})();


sample puppeteer call > 


(async () => {
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    const navigationPromise = page.waitForNavigation();

    await page.goto('https://jobs.workable.com/');
    await page.setViewport({ width: 1440, height: 744 });
    await navigationPromise;

    await page.waitForSelector('ul li h3 a');
    let jobTitles = await page.$$eval('ul li h3 a', titles => {
      return titles.map(title => title.innerText);
    });
    //console.log(`Job Titles on first page of Workable are: ${jobTitles.join(', ')}`);
    await browser.close();
  } catch (e) {
    //console.log(`Error while fetching workable job titles ${e.message}`);
  }
})();

*/
