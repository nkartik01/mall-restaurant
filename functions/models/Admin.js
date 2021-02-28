const mongoose = require("mongoose");
module.exports = Admin = mongoose.model("admin", new mongoose.Schema({}, { strict: false }));
