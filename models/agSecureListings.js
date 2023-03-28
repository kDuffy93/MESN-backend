const mongoose = require('mongoose');

const rentalListingSchema = new mongoose.Schema({
    source: { type: String, required: true }, // baseURL of the website the ad was captured from
    listingURL: { type: String, required: true }, // link to the listing
  datePosted: { type: Date, required: true }, // date the ad was posted
  location: {
    stratified_area: { type: String, required: true }, // local stratified area of rental unit
    municipality: { type: String, required: true }, // local municipality of rental unit
    address: { type: String, required: true }, // full address of rental unit
    geolocation: { type: String } // geolocation coordinates if available
  },
  bedrooms: { type: Number, required: true }, // number of bedrooms
  rent: { type: Number, required: true }, // monthly rent in Canadian dollars (excluding fees)
  housingType: { type: String, required: true }, // type of housing (detached, attached, apartment, etc.)
  description: { type: String }, // open text field for poster-provided descriptions
  utilities: {
    type: { type: String }, // type of utility (gas, electricity, internet)
    price: { type: Number } // price charged to tenant for utilities
  },
  leaseType: { type: String, required: true }, // type of lease (short term, long term, seasonal)
  screenshot: { type: String }, // screenshot of the ad for verification during cleaning/analysis
  advertisedBy: { type: String, required: true }, // whether unit was advertised privately or by a management company
  methodology: { type: String, required: true } // manual methodology used for data collection
});

const RentalListing = mongoose.model('RentalListing', rentalListingSchema);

module.exports = RentalListing;
