const mongoose = require("mongoose");
module.exports = Config = mongoose.model(
  "config",
  new mongoose.Schema({}, { strict: false })
);
