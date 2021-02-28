const mongoose = require("mongoose");
module.exports = Card = mongoose.model("card", new mongoose.Schema({}, { strict: false }));
