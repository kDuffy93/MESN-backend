var express = require("express");
//for scraping SPA's
const puppeteer = require("puppeteer");
//for scraping SSR sites
const axios = require("axios");
const cheerio = require("cheerio");

var router = express.Router();
//let rentalData = require('../../public/json/rentalData.json')
const RentalData = require("../../models/rentalData");
const HousingType = require("../../models/housingType");
const Municipality = require("../../models/municipality");
const StratifiedArea = require("../../models/stratifiedArea");
const UnitSize = require("../../models/unitSize");
const AgSecureListings = require("../../models/agSecureListings");

/* GET home page. */
router.get("/", async function (req, res, next) {
  let rentalData = await RentalData.find({});
  setTimeout(() => {
    //console.log("i ran");
    res.status(200).json(rentalData);
  }, 90000);
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
console.log("i ran after posting at sample");
  getAGSecureData();
});

let getAGSecureData = async () => {
  let baseURL = "https://www.agsecure.ca";
  const cities = [
    {
      name: "Alliston",
      municipality: "New Tecumseth",
      stratified_area: "Alliston/Breadford",
    },
    { name: "Angus", municipality: "Essa", stratified_area: "Barrie" },
    { name: "Barrie", municipality: "Barrie", stratified_area: "Barrie" },
    {
      name: "Bradford",
      municipality: "bradford West Gwillimbury",
      stratified_area: "Alliston/Breadford",
    },
    {
      name: "Collingwood",
      municipality: "Collingwood",
      stratified_area: "Collingwood",
    },
    {
      name: "Friday Harbour",
      municipality: "Innisfil",
      stratified_area: "Barrie",
    },
    { name: "Innisfil", municipality: "Innisfil", stratified_area: "Barrie" },
    { name: "Midland", municipality: "Midland", stratified_area: "Midland" },
    { name: "Orillia", municipality: "Orillia", stratified_area: "Orillia" },
    {
      name: "Tottenham",
      municipality: "New Tecumseth",
      stratified_area: "Alliston/Breadford",
    },
    {
      name: "Wasaga",
      municipality: "Wasage Beach",
      stratified_area: "Collingwood",
    },
  ];

  await cities.forEach(async (city) => {
    const url = `https://www.agsecure.ca/listings/${city.name}/`;
    await agSecureFetch1(url, baseURL, city);

    objectIds.forEach(async (id) => {
      let tempObj = await AgSecureListings.findById(id);
      //perform another fertch on full listing and grab the rest of the data
      //console.log(`${tempObj.listingURL}`);
      //agSecureFetch2(tempObj.listingURL);
    });
  });

 
  
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
      let unitSize = $(noOfProperties[i].children[3].children[9].children).text();
      let pttrn = /^\s*/;
      let spacesBeforeText = String(unitSize).match(pttrn)[0].length;
      let numberOfBedrooms = unitSize.slice(spacesBeforeText, spacesBeforeText + 1);
      numberOfBedrooms = (numberOfBedrooms === 'b' || numberOfBedrooms === 'B') ? 1 : numberOfBedrooms;
      let adLink = `${baseUrl}${$(noOfProperties[i].children[3].children[9].children[3].children[0]).attr("href")}`;


      console.log(`numberOfBedrooms: ${numberOfBedrooms}`);
      console.log(`unitSize: ${unitSize} `);
      console.log(address);
      console.log(`price: ${priceDollars}`);
      console.log(`period ${period}`);
      console.log(`adLink  ${adLink}`);

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
      let tempDBoBJ = await AgSecureListings.create(tempObject);
      objectIds = [tempDBoBJ._id, ...objectIds];
    }
    //console.log(objectIds.length);
// loop through object IDS and do a model lookup based on that id. then find the corresponding listingURL 
// from the object and perform another fetch to fill in the rest of the data on the correct object






  } catch (e) {
    console.error(`Error while fetching rental properties for ${city} on ${url}`);
    console.error(e);
  }
};

let agSecureFetch2 = async (url) => {
  const response = await axios.get(url);
    ////console.log(response);
    const $ = cheerio.load(response.data);
    ////console.log($);
    const listingleftDiv = $(".listing-left");
    const listingRightDiv = $(".listing-map");
    
   // console.log(listingleftDiv);
    //console.log(listingRightDiv);
}

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
