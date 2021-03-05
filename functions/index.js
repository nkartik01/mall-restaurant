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
app.use("/card", require("./card"));
app.use("/login", require("./login"));
app.use("/menu", require("./menu"));
app.use("/signup", require("./signup"));
app.use("/operator", require("./operator"));
app.use("/chef", require("./chef"));
app.use("/bill", require("./bill"));
app.use("/report", require("./report"));
app.use("/booking", require("./booking"));
// console.log(path.resolve(__dirname, "..", "client", "build", "index.html"));
// app.get("*", (req, res) => {
//   res.sendFile(path.resolve(__dirname, "..", "client", "build", "index.html"));
// });

// Create and Deploy Your First Cloud Functions
// https://firebase.google.com/docs/functions/write-firebase-functions

// exports.api = functions.https.onRequest(app);
connectDB().then(async () =>
  app.listen(5000, () => {
    console.log("Listening");
  })
);
