const express = require("express");
const router = express.Router();
const auth_admin = require("./middleware/auth_admin");
const auth_operator = require("./middleware/auth_operator");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("./config/default.json");
const OperatorTransaction = require("./models/OperatorTransaction");
router.post("/edit", auth_admin, async (req, res) => {
  const { username, password } = req.body;
  try {
    var operator = await Operator.findOne({ username });
    if (!operator) {
      return res.status(400).send("Operator doesnt exist");
    }
    operator = operator.toJSON();
    operator = {
      ...operator,
      name: req.body.name,
      username: username,
      balance: parseInt(req.body.balance),
      permissions: req.body.permissions,
      lastEdited: req.admin.id,
    };
    await new OperatorTransaction({
      type: "operatorEdit",
      at: Date.now(),
      amount: "new balance: " + req.body.balance,
      bill: "Done By: " + req.admin.id,
      operatorId: req.operator.id,
    }).save();
    try {
      (
        await Operator.findOneAndReplace({ username }, operator, {
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

router.get("/getOperator/:username", async (req, res) => {
  try {
    var operator = await Operator.findOne({ username: req.params.username });
    if (operator) {
      operator = operator.toJSON();
      var transactions = await OperatorTransaction.find({
        operatorId: req.params.username,
      })
        .sort({ at: "asc" })
        .limit(30)
        .sort({ at: "desc" });
      for (var i = 0; i < transactions.length; i++) {
        transactions[i] = transactions[i].toJSON();
      }
      operator.transactions = transactions;
      return res.send(operator);
    }
    return res.status(400).send("No operator found");
  } catch (err) {
    console.log(err);
    return res.status(500).send(err.toString());
  }
});

router.get("/getOperatorList", auth_admin, async (req, res) => {
  try {
    var operators = await Operator.find({});
    for (var i = 0; i < operators.length; i++) {
      operators[i] = operators[i].toJSON();
      operators[i] = {
        name: operators[i].name,
        username: operators[i].username,
      };
    }
    return res.send({ operators });
  } catch (err) {
    console.log(err);
    return res.status(500).send(err.toString());
  }
});

router.get("/getPermissions", auth_operator, async (req, res) => {
  try {
    var operator = (
      await Operator.findOne({ username: req.operator.id })
    ).toJSON();
    res.send({ permissions: operator.permissions });
  } catch (err) {
    console.log(err);
    res.status(500).send(err.toString());
  }
});

module.exports = router;
