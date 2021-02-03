const express = require("express");
const router = express.Router();
const admin = require("firebase-admin");
const db = admin.firestore();
const auth_admin = require("./middleware/auth_admin");
const auth_operator = require("./middleware/auth_operator");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("config");

router.post("/edit", auth_admin, async (req, res) => {
  const { username, password } = req.body;
  try {
    var operator = await db.collection("operator").where("username", "==", username).get();
    console.log(operator.size, operator.docs.length);
    if (operator.size === 0) {
      return res.status(400).send("Operator doesnt exist");
    }
    var operator1 = {
      name: req.body.name,
      username: username,
      permissions: req.body.permissions,
      lastEdited: req.admin.id,
    };
    try {
      await admin.firestore().collection("operator").doc(username).update(operator1);
      const payload = {
        user: {
          id: username,
        },
      };
      jwt.sign(payload, config.get("JWTSecretOperator"), (err, token) => {
        if (err) throw err;
        return res.status(200).json({
          token: token,
          id: username,
        });
      });
    } catch (err) {
      console.log(err);
      return res.status(400).json(err);
    }
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

router.get("/getOperator/:username", auth_admin, async (req, res) => {
  try {
    var operator = await db.collection("operator").doc(req.params.username).get();
    if (operator.data()) {
      return res.send(operator.data());
    }
    return res.status(400).send("No operator found");
  } catch (err) {
    console.log(err);
    return res.status(500).send(err);
  }
});

router.get("/getOperatorList", auth_admin, async (req, res) => {
  try {
    var operators = await db.collection("operator").get();

    operators = operators.docs;
    for (var i = 0; i < operators.length; i++) {
      operators[i] = operators[i].data();
      operators[i] = {
        name: operators[i].name,
        username: operators[i].username,
      };
    }
    return res.send({ operators });
  } catch (err) {
    console.log(err);
    return res.status(500).send(err);
  }
});

router.get("/getPermissions", auth_operator, async (req, res) => {
  try {
    var operator = await db.collection("operator").doc(req.operator.id).get();
    operator = operator.data();
    res.send({ permissions: operator.permissions });
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
});

module.exports = router;
