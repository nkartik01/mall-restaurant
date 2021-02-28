const mongoose = require("mongoose");
module.exports = Menu = mongoose.model("menu", new mongoose.Schema({}, { strict: false }));
