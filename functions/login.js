const express = require("express");
const router = express.Router();
const auth_admin = require("./middleware/auth_admin");
const auth_operator = require("./middleware/auth_operator");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("config");
const Admin = require("./models/Admin");
router.post("/admin", async (req, res) => {
  try {
    const { username, password } = req.body;
    try {
      var admin = (await Admin.findOne({ username })).toObject();
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
    return res.status(500).send(err.toString());
  }
});

router.post("/operator", async (req, res) => {
  try {
    const { username, password } = req.body;
    var operator = await Operator.findOne({ username });
    if (!operator) {
      return res.status(400).send("Operator not found");
    }
    operator = operator.toObject();
    const isMatch = await bcryptjs.compare(password, operator.password);
    if (!isMatch) {
      return res.status(400).send("Wrong Password");
    }
    const payload = {
      operator: {
        id: username,
      },
    };
    jwt.sign(payload, config.get("JWTSecretOperator"), (err, token) => {
      if (err) throw err;
      return res.status(200).json({
        id: username,
        token: token,
        permissions: operator.permissions,
      });
    });
  } catch (err) {
    console.log(err);
    res.status(500).send(err.toString());
  }
});

module.exports = router;
