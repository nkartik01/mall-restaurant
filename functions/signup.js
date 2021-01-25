const express = require("express");
const router = express.Router();
const admin = require("firebase-admin");
const db = admin.firestore();
const auth_admin = require("./middleware/auth_admin");
const auth_operator = require("./middleware/auth_operator");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("config");

router.post("/operator", auth_admin, async (req, res) => {
  const { username, password } = req.body;
  try {
    var operator = await db
      .collection("operator")
      .where("username", "==", username)
      .get();
    console.log(operator.size, operator.docs.length);
    if (operator.size !== 0) {
      return res.status(400).send("Operator already exists");
    }
    var operator1 = {
      name: req.body.name,
      username: username,
      password: password,
      permissions: req.body.permissions,
      lastEdited: req.admin.id,
    };
    const salt = await bcryptjs.genSalt(10);
    operator1.password = await bcryptjs.hash(password, salt);
    try {
      await admin
        .firestore()
        .collection("operator")
        .doc(username)
        .set(operator1);
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

module.exports = router;
