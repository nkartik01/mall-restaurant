const express = require("express");
const router = express.Router();
const admin = require("firebase-admin");
const db = admin.firestore();
const auth_admin = require("./middleware/auth_admin");
const auth_operator = require("./middleware/auth_operator");
const Card = require("./models/Card");
const Table = require("./models/Table");
// router.post("/registerCard", auth_admin, async (req, res) => {
router.post("/registerCard", auth_admin, async (req, res) => {
  try {
    var uid = req.body.uid;
    console.log(uid);
    var card = await Card.findOne({ uid });
    if (card) {
      return res.status(400).send("Already Registered");
    }
    new Card({ uid, balance: 0, transactions: [], category: "regular", holder: { assigned: false }, registerdBy: req.admin.id, cardId: uid }).save();
    return res.send("Card Created");
  } catch (err) {
    console.log(err);
    return res.status(500).send(err);
  }
});

router.get("/getCard/:uid", auth_operator, async (req, res) => {
  try {
    var card = await Card.findOne({ uid: req.params.uid });
    if (!card) {
      return res.status(400).send("card not found");
    }
    card = card.toObject();
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
    var card = await Card.findOne({ uid });
    card = card.toObject();
    card.balance = card.balance + req.body.amount;
    card.transactions.unshift({
      by: req.operator.id,
      type: "addition",
      details: { prevBalance: card.balance - req.body.amount, newBalance: card.balance, amount: req.body.amount },
      at: Date.now(),
    });
    var operator = await Operator.findOne({ operatorId: req.operator.id });
    operator = operator.toObject();
    operator.balance = operator.balance + req.body.amount;
    if (!operator.transactions) operator.transactions = [];
    operator.transactions.unshift({ type: "balanceAdd", amount: req.body.amount, at: Date.now() });
    (await Operator.findOneAndUpdate({ operatorId: req.operator.id }, operator, { useFindAndModify: false })).save();
    (await Card.findOneAndUpdate({ uid }, card, { useFindAndModify: false })).save();
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
    var card = await Card.findOne({ uid });
    card = card.toObject();
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
        amount: req.body.amount,
      },
      // orderId: req.body.orderId,
    });
    console.log(card);

    var bill = await Bill.findOne({ billId: req.body.bill });
    bill = bill.toObject();

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
      (await Table.findOneAndUpdate({ tableId: req.body.table }, { balance: bill.balance }, { useFindAndModify: false })).save();
    }
    var operator = await Operator.findOne({ operatorId: req.operator.id });
    operator = operator.toObject();
    bill.transactions.unshift({ type: "rfid", rfid: req.body.uid, by: req.operator.id, at: now, amount: req.body.amount });
    operator.transactions.unshift({ type: "rfid", tranId: req.body.uid, at: now, amount: req.body.amount, bill: req.body.bill });
    (await Bill.findOneAndUpdate({ billId: req.body.bill }, bill, { useFindAndModify: false })).save();
    (await Card.findOneAndUpdate({ cardId: uid }, card, { useFindAndModify: false })).save();
    (await Operator.findOneAndUpdate({ operatorId: req.operator.id }, operator, { useFindAndModify: false })).save();
    return res.send("amount deducted sucessfully");
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
});

router.post("/assign", auth_operator, async (req, res) => {
  try {
    var card = await Card.findOne({ uid: req.body.uid });
    card = card.toObject();
    card.holder = req.body.holder;
    card.holder.assigned = true;
    card.balance = parseInt(req.body.balance);
    card.transactions.unshift({ type: "assign", by: req.operator.id, details: { to: card.holder }, at: parseInt(Date.now()) });
    var operator = await Operator.findOne({ operatorId: req.operator.id });
    operator = operator.toObject();
    operator.balance = parseInt(operator.balance) + parseInt(req.body.balance);
    if (!operator.transactions) operator.transactions = [];
    operator.transactions.unshift({ type: "assign", amount: req.body.balance, at: Date.now(), details: { to: card.holder } });
    (await Operator.findOneAndUpdate({ operatorId: req.operator.id }, operator, { useFindAndModify: false })).save();

    (await Card.findOneAndUpdate({ uid: req.body.uid }, card, { useFindAndModify: false })).save();
    return res.send("Assigned");
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
});

router.post("/retire", auth_operator, async (req, res) => {
  try {
    var card = await Card.findOne({ uid: req.body.uid });
    var operator = await Operator.findOne({ operatorId: req.operator.id });
    operator = operator.toObject();
    card = card.toObject();
    card.holder = { assigned: false };
    card.transactions.unshift({ type: "retire", by: req.operator.id, at: parseInt(Date.now()), details: { paidAmount: card.balance } });
    operator.balance = operator.balance - card.balance;
    if (!operator.transactions) operator.transactions = [];
    operator.transactions.unshift({ type: "retire", amount: card.balance, at: Date.now() });
    (await Operator.findOneAndUpdate({ operatorId: req.operator.id }, operator, { useFindAndModify: false })).save();
    (await Card.findOneAndUpdate({ uid: req.body.uid }, card, { useFindAndModify: false })).save();
    return res.send("Retired");
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
});

router.get("/searchByPhone/:phone", auth_operator, async (req, res) => {
  try {
    var cards = await Card.find({ "holder.mobile": req.params.phone });
    // console.log(cards);

    for (var i = 0; i < cards.length; i++) {
      var card = cards[i].toObject();
      card.id = cards[i].cardId;
      cards[i] = card;
    }
    res.send({ cards: cards });
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
});

module.exports = router;
