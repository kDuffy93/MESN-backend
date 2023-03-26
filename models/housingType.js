const mongoose = require("mongoose");


const schemaDefinition = {};

let schemaObj = new mongoose.Schema(schemaDefinition);

module.exports = mongoose.model("rentalData", schemaObj);
