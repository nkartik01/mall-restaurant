const mongoose = require("mongoose");
module.exports = Bill = mongoose.model("bill", new mongoose.Schema({}, { strict: false }));
