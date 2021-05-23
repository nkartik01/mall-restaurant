const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const auth_admin = require("./middleware/auth_admin");
const auth_operator = require("./middleware/auth_operator");
router.post("/sale", async (req, res) => {
  try {
    var start = new Date(parseInt(req.body.start));
    start.setHours(0, 0, 0, 0);
    start = start.valueOf();
    var end = new Date(parseInt(req.body.end));
    end.setHours(23, 59, 59, 999);
    end = end.valueOf();

    var bills;
    var cancelled;
    if (req.body.restaurant !== "overall") {
      bills = await Bill.find({
        at: { $gt: start, $lte: end },
        cancelled: { $ne: true },
        restaurant: req.body.restaurant,
      });
      cancelled = await Bill.find({
        at: { $gt: start, $lte: end },
        cancelled: true,
        restaurant: req.body.restaurant,
      });
    } else {
      bills = await Bill.find({
        at: { $gt: start, $lte: end },
        cancelled: { $ne: true },
      });
      cancelled = await Bill.find({
        at: { $gt: start, $lte: end },
        cancelled: true,
      });
    }
    for (var i = 0; i < cancelled.length; i++) {
      var bill = cancelled[i].toJSON();
      bill.id = cancelled[i].billId;
      cancelled[i] = bill;
    }

    for (var i = 0; i < bills.length; i++) {
      var bill = bills[i].toJSON();
      bill.id = bills[i].billId;
      bills[i] = bill;
    }
    var sum = 0;
    var balance = 0;
    var discAmount = 0;
    bills.map((bill, _) => {
      sum = sum + bill.finalOrder.sum;
      balance = balance + bill.balance;
      if (bill.discAmount) discAmount = discAmount + bill.discAmount;
      return;
    });
    var upiSum = 0;
    var cashSum = 0;
    var rfidSum = 0;
    var cardSum = 0;

    var itemwise = [];
    var itemwiseEdit = [];
    bills.map((bill, _) => {
      try {
        bill.finalOrder.order.map((orderItem, _) => {
          var c = 0;
          itemwise.map((item, _) => {
            if (
              item.item === orderItem.item &&
              item.price === orderItem.price
            ) {
              item.quantity = item.quantity + orderItem.quantity;
              c = 1;
            }
          });
          if (c === 0) {
            itemwise.push({ ...orderItem });
          }
        });
      } catch {}
      itemwise.sort((a, b) => {
        if (a.item < b.item) {
          return -1;
        }
        if (a.item > b.item) {
          return 1;
        }
        return 0;
      });
      try {
        bill.orderChanges
          .filter((order, _) => {
            if (order.type === "edit") {
              return true;
            }
            return false;
          })
          .map((order, _) => {
            itemwiseEdit.push({ ...order });

            return;
          });
      } catch {}
      try {
        bill.transactions.map((tran, _) => {
          if (tran.type === "cash") cashSum = cashSum + tran.amount;
          if (tran.type === "card") cardSum = cardSum + tran.amount;
          if (tran.type === "rfid") rfidSum = rfidSum + tran.amount;
          if (tran.type === "upi") upiSum = upiSum + tran.amount;

          return;
        });
      } catch {}
      return;
    });
    res.send({
      bills: bills,
      itemwise,
      itemwiseEdit,
      upiSum,
      cashSum,
      cardSum,
      rfidSum,
      sum,
      balance,
      discAmount,
      cancelled,
    });
  } catch (err) {
    console.log(err);
    res.status(500).send(err.toString());
  }
});

router.get("/backup", async (req, res) => {
  return res.send(
    mongoose.connection.db.listCollections().toArray(function (err, names) {
      if (err) {
        console.log(err);
      } else {
        return names.forEach(function (e, i, a) {
          // Mongoose.connection.db.dropCollection(e.name);
          return e.name;
        });
      }
    })
  );
});

module.exports = router;
