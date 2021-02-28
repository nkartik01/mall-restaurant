const mongoose = require("mongoose");
var operatorSchema = new mongoose.Schema({ username: { type: String, required: true } }, { strict: false });
module.exports = Operator = mongoose.model("operator", operatorSchema);
