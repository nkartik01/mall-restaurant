const mongoose = require("mongoose");
var chefTransactionSchema = new mongoose.Schema({}, { strict: false });
module.exports = ChefTransaction = mongoose.model(
  "chefTransaction",
  chefTransactionSchema
);
