const express = require("express");
const router = express.Router();
const admin = require("firebase-admin");
const db = admin.firestore();
const auth_admin = require("./middleware/auth_admin");
const auth_operator = require("./middleware/auth_operator");

router.get("/listBills/:x", async (req, res) => {
  try {
    var x = parseInt(req.params.x);
    var bills = await db.collection("bill").orderBy("at", "desc").limit(x).get();
    bills = bills.docs;
    console.log(bills.length);
    bills = bills.filter((bill, ind) => {
      if (ind < x) {
        return true;
      }
      return false;
    });
    for (ind = 0; ind < bills.length; ind++) {
      var bill1 = bills[ind].data();
      bill1.id = bills[ind].id;
      bills[ind] = bill1;
    }
    res.send({ bills: bills });
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
});

module.exports = router;