const mongoose = require("mongoose");
module.exports = Room = mongoose.model("room", new mongoose.Schema({}, { strict: false }));
