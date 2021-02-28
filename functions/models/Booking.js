const mongoose = require("mongoose");
module.exports = Booking = mongoose.model("booking", new mongoose.Schema({}, { strict: false }));
