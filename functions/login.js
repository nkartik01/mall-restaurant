const express = require("express");
const router = express.Router();
const admin = require("firebase-admin");
const db = admin.firestore();
const auth_admin = require("./middleware/auth_admin");
const auth_operator = require("./middleware/auth_operator");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("config");

router.post("/admin", async (req, res) => {
  try {
    const { username, password } = req.body;
    try {
      const adminRef = db.collection("admin").doc(username);
      var admin = await adminRef.get();
      console.log(admin);
      admin = admin.data();

      const isMatch = await bcryptjs.compare(password, admin.password);
      if (!isMatch) {
        return res.status(400).send("Wrong Password");
      }
    } catch (err) {
      console.log(err);
      return res.status(400).send("User Not Found");
    }
    const payload = {
      admin: {
        id: username,
      },
    };
    jwt.sign(payload, config.get("JWTSecretAdmin"), (err, token) => {
      if (err) throw err;
      return res.status(200).json({
        id: username,
        token: token,
      });
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send(err);
  }
});

module.exports = router;
