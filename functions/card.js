const express = require("express");
const router = express.Router();
const admin = require("firebase-admin");
const db = admin.firestore();
const auth_admin = require("./middleware/auth_admin");
const auth_operator = require("./middleware/auth_operator");
// router.post("/registerCard", auth_admin, async (req, res) => {
router.post("/registerCard", auth_admin, async (req, res) => {
  try {
    var uid = req.body.uid;
    console.log(uid);
    var card = await db.collection("card").doc(uid).get();
    card = card.data();
    if (card) {
      return res.status(400).send("Already Registered");
    }
    db.collection("card").doc(uid).set({ uid, balance: 0, transactions: [], category: "regular", holder: {}, registerdBy: req.admin.id });
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
    card.transactions.unshift({
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
    if (!card) {
      return res.status(400).send("Card not recognized");
    }
    if (card.balance < req.body.amount) {
      return res.status(400).send("Insufficient Balance. Current Balance: " + card.balance + ", Need " + (req.body.amount - card.balance) + " more");
    }
    card.balance = card.balance - req.body.amount;
    var now = Date.now();
    card.transactions.unshift({
      by: req.operator.id,
      at: now,
      type: "deduction",
      details: {
        prevBalance: card.balance + req.body.amount,
        newBalance: card.balance,
        bill: req.body.bill,
      },
      // orderId: req.body.orderId,
    });
    console.log(card);

    var bill = await db.collection("bill").doc(req.body.bill).get();
    bill = bill.data();

    if (!bill) {
      return res.status(400).send("Issue with Bill");
    }
    if (!bill.transactions) {
      bill.transactions = [];
    }
    if (req.body.to) {
      bill.to = req.body.to;
    }
    bill.balance = bill.balance - req.body.amount;
    if (req.body.table) {
      db.collection("table").doc(req.body.table).update({ balance: bill.balance });
    }
    bill.transactions.unshift({ type: "rfid", rfid: req.body.uid, by: req.operator.id, at: now, amount: req.body.amount });
    db.collection("bill").doc(req.body.bill).set(bill);
    cardRef.set(card);
    return res.send("amount deducted sucessfully");
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
});

router.post("/assign", auth_operator, async (req, res) => {
  try {
    var card = await db.collection("card").doc(req.body.uid).get();
    card = card.data();
    card.holder = req.body.holder;
    card.holder.assigned = true;
    card.balance = parseInt(req.body.balance);
    card.transactions.unshift({ type: "assign", by: req.operator.id, details: { to: card.holder }, at: parseInt(Date.now()) });
    await db.collection("card").doc(req.body.uid).set(card);
    return res.send("Assigned");
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
});

router.post("/retire", auth_operator, async (req, res) => {
  try {
    var card = await db.collection("card").doc(req.body.uid).get();
    card = card.data();
    if (card.balance !== 0) {
      return res.status(400).send("Card not empty");
    }
    card.holder = { assigned: false };
    card.transactions.unshift({ type: "retire", by: req.operator.id, at: parseInt(Date.now()) });
    await db.collection("card").doc(req.body.uid).set(card);
    return res.send("Retired");
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
});

module.exports = router;
