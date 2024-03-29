const express = require("express");
const router = express.Router();
const auth_admin = require("./middleware/auth_admin");
const Operator = require("./models/OPERATOR");
const Chef = require("./models/Chef");
const bcryptjs = require("bcryptjs");

router.post("/operator", auth_admin, async (req, res) => {
  const { username, password } = req.body;
  try {
    // var operator = await db
    //   .collection("operator")
    //   .where("username", "==", username)
    //   .get();
    var operator = await Operator.findOne({ username });
    // console.log(operator.size, operator.docs.length);
    console.log(operator);
    if (operator) {
      return res.status(400).send("Operator already exists");
    }
    var operator1 = {
      name: req.body.name,
      username: username,
      password: password,
      permissions: req.body.permissions,
      lastEdited: req.admin.id,
      operatorId: req.body.username,
    };
    const salt = await bcryptjs.genSalt(10);
    operator1.password = await bcryptjs.hash(password, salt);
    try {
      operator = new Operator(operator1);
      operator.save();
      // await admin.firestore().collection("operator").doc(username).set(operator1);
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

router.post("/chef", auth_admin, async (req, res) => {
  const { username, password } = req.body;
  try {
    // var chef = await db
    //   .collection("chef")
    //   .where("username", "==", username)
    //   .get();
    var chef = await Chef.findOne({ username });
    // console.log(chef.size, chef.docs.length);
    console.log(chef);
    if (chef) {
      return res.status(400).send("chef already exists");
    }
    var chef1 = {
      name: req.body.name,
      username: username,
      password: password,
      permissions: req.body.permissions,
      lastEdited: req.admin.id,
      chefId: req.body.username,
    };
    const salt = await bcryptjs.genSalt(10);
    chef1.password = await bcryptjs.hash(password, salt);
    try {
      chef = new Chef(chef1);
      chef.save();
      // await admin.firestore().collection("operator").doc(username).set(operator1);
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

module.exports = router;
