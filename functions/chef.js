const express = require("express");
const router = express.Router();
const auth_admin = require("./middleware/auth_admin");
const auth_chef = require("./middleware/auth_chef");
const ChefSide = require("./models/ChefSide");
const Chef = require("./models/Chef");

router.post("/edit", auth_admin, async (req, res) => {
  const { username, password } = req.body;
  try {
    var chef = await Chef.findOne({ username });
    if (!chef) {
      return res.status(400).send("Chef doesnt exist");
    }
    chef = chef.toJSON();
    chef = {
      ...chef,
      name: req.body.name,
      username: username,
      balance: parseInt(req.body.balance),
      permissions: req.body.permissions,
      lastEdited: req.admin.id,
    };
    await new ChefTransaction({
      type: "chefEdit",
      at: Date.now(),
      amount: "new balance: " + req.body.balance,
      bill: "Done By: " + req.admin.id,
      chefId: req.chef.id,
    }).save();
    try {
      (
        await Chef.findOneAndReplace({ username }, chef, {
          useFindAndModify: false,
        })
      ).save();
      res.send("Done");
    } catch (err) {
      console.log(err);
      return res.status(400).json(err);
    }
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

router.get("/getChef/:username", async (req, res) => {
  try {
    var chef = await Chef.findOne({ username: req.params.username });
    if (chef) {
      chef = chef.toJSON();
      var transactions = await ChefTransaction.find({
        chefId: req.params.username,
      })
        .sort({ at: "asc" })
        .limit(30)
        .sort({ at: "desc" });
      for (var i = 0; i < transactions.length; i++) {
        transactions[i] = transactions[i].toJSON();
      }
      chef.transactions = transactions;
      return res.send(chef);
    }
    return res.status(400).send("No chef found");
  } catch (err) {
    console.log(err);
    return res.status(500).send(err.toString());
  }
});

router.get("/getChefList", auth_admin, async (req, res) => {
  try {
    var chefs = await Chef.find({});
    for (var i = 0; i < chefs.length; i++) {
      chefs[i] = chefs[i].toJSON();
      chefs[i] = {
        name: chefs[i].name,
        username: chefs[i].username,
      };
    }
    return res.send({ chefs });
  } catch (err) {
    console.log(err);
    return res.status(500).send(err.toString());
  }
});

router.get("/getPendingOrders", auth_chef, async (req, res) => {
  try {
    const d = new Date();
    const year = d.getUTCFullYear();
    const month = d.getUTCMonth();
    const day = d.getUTCDate();
    const startTime = Date.UTC(year, month, day, 0, 0, 0, 0);
    console.log(startTime);
    var orders = await ChefSide.find({
      at: { $gte: startTime },
      done: { $ne: true },
    });
    for (var i = 0; i < orders.length; i++) {
      var order = orders[i].toJSON();
      // order.id = orders[i].chefSideId;
      orders[i] = order;
    }
    // orders.map((order, i) => {
    //   order.order.map((x, j) => {
    //     if (x.status === "done") {
    //       orders[i].order.splice(j, 1);
    //     }
    //   });
    // });
    // orders = orders.filter((order, i) => {
    //   if (order.order.length === 0) {
    //     return false;
    //   }
    //   return true;
    // });
    return res.send(orders);
  } catch (err) {
    console.log(err);
    res.status(500).send(err.toString());
  }
});

router.post("/setAsDone", auth_chef, async (req, res) => {
  try {
    (await ChefSide.findByIdAndUpdate(req.body.id, { done: true })).save();
    return res.send("Done");
  } catch (err) {
    console.log(err);
    res.status(500).send(err.toString());
  }
});

module.exports = router;
