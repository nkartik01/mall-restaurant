const mongoose = require("mongoose");
var chefSchema = new mongoose.Schema(
  { username: { type: String, required: true } },
  { strict: false }
);
module.exports = Chef = mongoose.model("chef", chefSchema);
