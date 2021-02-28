const mongoose = require("mongoose");
module.exports = Restaurant = mongoose.model("restaurant", new mongoose.Schema({}, { strict: false }));
