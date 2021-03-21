const express = require("express");
const router = express.Router();
const auth_admin = require("./middleware/auth_admin");
const auth_operator = require("./middleware/auth_operator");
const ChefSide = require("./models/ChefSide");

router.get("/getPendingOrders", auth_operator, async (req, res) => {
  try {
    var orders = await ChefSide.find({});
    for (var i = 0; i < orders.length; i++) {
      var order = orders[i].toJSON();
      order.id = orders[i].chefSideId;
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
    res.status(500).send(err.toString());
  }
});

router.post("/setAsDone", auth_operator, async (req, res) => {
  try {
  } catch (err) {
    console.log(err);
    res.status(500).send(err.toString());
  }
});

module.exports = router;
