const express = require("express");
const connectDB = require("./config/db");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");
var app = express();

app.use(bodyParser.json());
app.use(express.json({ extended: false, limit: "100mb" }));
// app.use(cors(corsOpts));
app.use(cors());
app.use("/api/card", require("./card"));
app.use("/api/login", require("./login"));
app.use("/api/menu", require("./menu"));
app.use("/api/signup", require("./signup"));
app.use("/api/operator", require("./operator"));
app.use("/api/chef", require("./chef"));
app.use("/api/bill", require("./bill"));
app.use("/api/report", require("./report"));
app.use("/api/booking", require("./booking"));
connectDB().then(async () =>
  app.listen(5000, () => {
    console.log("Listening");
  })
);
