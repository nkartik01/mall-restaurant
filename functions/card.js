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
    var card = await db.collection("card").doc(uid).get();
    card = card.data();
    if (card) {
      return res.status(400).send("Already Registered");
    }
    db.collection("card").doc(uid).set({ uid, balance: 0, transactions: [], category: "regular" });
    return res.send("Card Created");
  } catch (err) {
    console.log(err);
    return res.status(500).send(err);
  }
});

router.get("/getCard/:uid", auth_operator, async (req, res) => {
  try {
    var card = await db.collection("card").doc(req.params.uid).get();
    card = card.data();
    if (!card) {
      return res.status(400).send("card not found");
    }
    res.send({ card });
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
});

router.post("/addAmount", auth_operator, async (req, res) => {
  try {
    if (req.body.amount < 0) {
      return res.status(400).send("Negetive amount not allowed.");
    }
    var uid = req.body.uid;
    var cardRef = db.collection("card").doc(uid);
    var card = await cardRef.get();
    card = card.data();
    card.balance = card.balance + req.body.amount;
    card.transactions.push({
      by: req.operator.id,
      prevBalance: card.balance - req.body.amount,
      newBalance: card.balance,
      transactionId: req.body.transactionId,
    });
    cardRef.set(card);
    return res.send("amount added");
  } catch (err) {
    console.log(err);
    return res.status(500).send(err);
  }
});

router.post("/deductAmount", auth_operator, async (req, res) => {
  try {
    if (req.body.amount < 0) {
      return res.status(400).send("Negetive amount not allowed.");
    }
    var uid = req.body.uid;
    var cardRef = db.collection("card").doc(uid);
    var card = await cardRef.get();
    card = card.data();
    card.balance = card.balance - req.body.amount;
    card.transactions.push({
      by: req.operator.id,
      prevBalance: card.balance + req.body.amount,
      newBalance: card.balance,
      orderId: req.body.orderId,
    });

    cardRef.set(card);
    return res.send("amount deducted sucessfully");
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
});

module.exports = router;
