const express = require("express");
const router = express.Router();
const admin = require("firebase-admin");
const db = admin.firestore();
const auth_admin = require("./middleware/auth_admin");
const auth_operator = require("./middleware/auth_operator");
// router.post("/registerCard", auth_admin, async (req, res) => {
router.post("/registerCard", async (req, res) => {
  try {
    var uid = req.body.uid;
    console.log(uid);
    db.collection("card").doc(uid).set({ uid, balance: 0, transactions: [] });
    return res.send("Card Created");
  } catch (err) {
    console.log(err);
    return res.status(500).send(err);
  }
});

router.post("/addBalance", auth_operator, async (req, res) => {
  try {
    if (req.body.amount < 0) {
      return res.status(400).send("Negetive balance not allowed.");
    }
    var uid = req.body.uid;
    var cardRef = db.collection("card").doc(uid);
    var card = await cardRef.get();
    card = card.data();
    cardRef.update({ balance: card.balance + req.body.amount });
    return res.send("balance added");
  } catch (err) {
    console.log(err);
    return res.status(500).send(err);
  }
});

module.exports = router;
