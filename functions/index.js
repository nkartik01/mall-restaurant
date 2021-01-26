const functions = require("firebase-functions");
const express = require("express");
const admin = require("firebase-admin");
const cors = require("cors");
const bodyParser = require("body-parser");
var serviceAccount = require("./mall-restraunt-firebase-adminsdk-qdvnt-161a87ebf0");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://mall-restaurant.firebaseio.com",
  storageBucket: "https://mall-restaurant.appspot.com",
});
var app = express();
app.use(bodyParser.json());
app.use(express.json({ extended: false }));
// app.use(cors(corsOpts));
app.use(cors());
app.use("/card", require("./card"));
app.use("/login", require("./login"));
app.use("/menu", require("./menu"));
app.use("/signup", require("./signup"));
app.use("/operator", require("./operator"));
app.use("/chef", require("./chef"));
// Create and Deploy Your First Cloud Functions
// https://firebase.google.com/docs/functions/write-firebase-functions

exports.api = functions.https.onRequest(app);
