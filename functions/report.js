const express = require("express");
const router = express.Router();
const admin = require("firebase-admin");
const db = admin.firestore();
const auth_admin = require("./middleware/auth_admin");
const auth_operator = require("./middleware/auth_operator");

router.post("/sale", async (req, res) => {
  try {
    var start = new Date(req.body.start);
    start.setHours(0, 0, 0, 0);
    start = start.valueOf();
    var end = new Date(req.body.end);
    end.setHours(23, 59, 59, 999);
    end = end.valueOf();
    var bills = await db.collection("bill").where("at", ">=", start).where("at", "<=", end).get();
    bills = bills.docs;
    for (var i = 0; i < bills.length; i++) {
      var bill = bills[i].data();
      bill.id = bills[i].id;
      bills[i] = bill;
    }
    res.send({ bills: bills });
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
});

module.exports = router;
