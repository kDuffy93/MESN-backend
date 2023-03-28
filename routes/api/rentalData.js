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
    console.log("i ran");
    res.status(200).json(rentalData);
  }, 1000);
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
  console.log("i ran after posting");
  res.status(200).json(rentalData); */

  getAGSecureData();
});

let getAGSecureData = async () => {
  let baseURL = 'https://www.agsecure.ca';
  const cities =[
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
    { name: "Wasaga", municipality: "Wasage Beach", stratified_area: "Collingwood" }
  ]
 
  
   await cities.forEach(city => {
    const url = `https://www.agsecure.ca/listings/${city.name}/`;
     axiosFetch(url, baseURL, city);
  });  
};

let axiosFetch = async (url, baseUrl, city ) => {
  try {
    const response = await axios.get(url);
    //console.log(response);
    const $ = cheerio.load(response.data);
    //console.log($);
    const noOfProperties = $(".listing");
   
    console.log(
      `${noOfProperties.length} are open for rent in ${city.name} in ${city.municipality} in ${city.stratified_area} on ${url}`
    );

    for (let i = 0; i < noOfProperties.length; i++) {
      let address = $(
        noOfProperties[i].children[3].children[1].children[0]
      ).text();
      console.log(address);

      // populate object from noOfProperties[i]
      let tempObject = {
        source: `${baseUrl}`,
        listingURL: ``,
        datePosted: new Date(),
        location: {
          stratifiedArea: `${city.stratified_area}`,
          municipality: `${city.municipality}`,
          address: `${address}`,
          geolocation: `44.3894,-79.6903`,// in 3rd script of map = start_lat / start_long
        },
        bedrooms: 2,
        rent: 1200,
        housingType: `Apartment`,
        description: `Cozy apartment in a great location!`,
        utilities: {
          type: `Electricity`,
          price: 50,
        },
        leaseType: `Long term`,
        screenshot: `https://example.com/screenshot.png`,
        advertisedBy: `Private`,
        methodology: `County of Simcoe manual methodology`,
      };
      ;

      // create a new database record
      // AgSecureListings.create(tempObject);
    }
  } catch (e) {
    console.error(
      `Error while fetching rental properties for ${city} on ${url}`
    );
    console.log(e);
  }
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
    console.log(`${noOfProperties} are open for rent in ${postCode} postcode of Australia on Domain`);
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
    console.log(`Job Titles on first page of Workable are: ${jobTitles.join(', ')}`);
    await browser.close();
  } catch (e) {
    console.log(`Error while fetching workable job titles ${e.message}`);
  }
})();

*/
