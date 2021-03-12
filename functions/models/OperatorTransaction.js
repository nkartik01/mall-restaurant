const mongoose = require("mongoose");
var operatorTransactionSchema = new mongoose.Schema({}, { strict: false });
module.exports = OperatorTransaction = mongoose.model("operatorTransaction", operatorTransactionSchema);
