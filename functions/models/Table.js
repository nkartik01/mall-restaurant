const mongoose = require("mongoose");
module.exports = Table = mongoose.model("table", new mongoose.Schema({}, { strict: false }));
