const express = require("express");
const router = express.Router();
const admin = require("firebase-admin");
const db = admin.firestore();
const auth_admin = require("./middleware/auth_admin");
const auth_operator = require("./middleware/auth_operator");

router.get("/getPendingOrders", auth_operator, async (req, res) => {
  try {
    var orders = db.collection("chefSide").get();
    orders = (await orders).docs;
    for (var i = 0; i < orders.length; i++) {
      var order = orders[i].data();
      order.id = orders[i].id;
      orders[i] = order;
    }
    orders.map((order, i) => {
      order.order.map((x, j) => {
        if (x.status === "done") {
          orders[i].order.splice(j, 1);
        }
      });
    });
    orders = orders.filter((order, i) => {
      if (order.order.length === 0) {
        return false;
      }
      return true;
    });
    return res.send(orders);
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
});

router.post("/setAsDone", auth_operator, async (req, res) => {
  try {
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
});

module.exports = router;