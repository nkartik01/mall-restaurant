const express = require("express");
const router = express.Router();
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("./config/default.json");
const Admin = require("./models/Admin");
const auth_admin = require("./middleware/auth_admin");
const auth_operator = require("./middleware/auth_operator");
const auth_chef = require("./middleware/auth_chef");
router.post("/admin", async (req, res) => {
  try {
    const { username, password } = req.body;
    try {
      var admin = (await Admin.findOne({ username })).toJSON();
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
    jwt.sign(
      payload,
      config.JWTSecretAdmin,
      { expiresIn: 8 * 60 * 60 * 1000 },
      async (err, token) => {
        if (err) throw err;

        var admin = await Admin.findOne({ username: "kartik" });
        admin = admin.toJSON();

        var x = jwt.decode(admin.key, config.JWTSecretAdmin);
        console.log(x);
        if (x.date < Date.now()) return res.send({ warn: x.date });
        if (x.date < Date.now() + 1296000000)
          return res.send({ warn: x.date, id: username, token: token });
        return res.send({ id: username, token: token });
        // return res.status(200).json({
        // });
      }
    );
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
    operator = operator.toJSON();
    const isMatch = await bcryptjs.compare(password, operator.password);
    if (!isMatch) {
      return res.status(400).send("Wrong Password");
    }
    const payload = {
      operator: {
        id: username,
      },
    };
    jwt.sign(
      payload,
      config.JWTSecretOperator,
      { expiresIn: 8 * 60 * 60 * 1000 },
      async (err, token) => {
        if (err) throw err;
        var admin = await Admin.findOne({ username: "kartik" });
        admin = admin.toJSON();

        var x = jwt.decode(admin.key, config.JWTSecretAdmin);
        if (x.date < Date.now()) return res.send({ warn: x.date });
        if (x.date < Date.now() + 1296000000)
          return res.send({
            warn: x.date,
            id: username,
            token: token,
            permissions: operator.permissions,
          });
        return res.send({
          id: username,
          token: token,
          permissions: operator.permissions,
        });
      }
    );
  } catch (err) {
    console.log(err);
    res.status(500).send(err.toString());
  }
});

router.post("/chef", async (req, res) => {
  try {
    const { username, password } = req.body;
    var chef = await Chef.findOne({ username });
    if (!chef) {
      return res.status(400).send("chef not found");
    }
    chef = chef.toJSON();
    const isMatch = await bcryptjs.compare(password, chef.password);
    if (!isMatch) {
      return res.status(400).send("Wrong Password");
    }
    const payload = {
      chef: {
        id: username,
      },
    };
    jwt.sign(
      payload,
      config.JWTSecretChef,
      { expiresIn: 8 * 60 * 60 * 1000 },
      async (err, token) => {
        if (err) throw err;
        var admin = await Admin.findOne({ username: "kartik" });
        admin = admin.toJSON();

        var x = jwt.decode(admin.key, config.JWTSecretAdmin);
        if (x.date < Date.now()) return res.send({ warn: x.date });
        if (x.date < Date.now() + 1296000000)
          return res.send({
            warn: x.date,
            id: username,
            token: token,
            permissions: chef.permissions,
          });
        return res.send({
          id: username,
          token: token,
          permissions: chef.permissions,
        });
      }
    );
  } catch (err) {
    console.log(err);
    res.status(500).send(err.toString());
  }
});

router.get("/verify/admin", auth_admin, async (req, res) => {
  try {
    return res.send("Verified");
  } catch (err) {
    console.log(err);
    res.status(500).send(err.toString());
  }
});
router.get("/verify/operator", auth_operator, async (req, res) => {
  try {
    return res.send("Verified");
  } catch (err) {
    console.log(err);
    res.status(500).send(err.toString());
  }
});
router.get("/verify/chef", auth_chef, async (req, res) => {
  try {
    return res.send("Verified");
  } catch (err) {
    console.log(err);
    res.status(500).send(err.toString());
  }
});

module.exports = router;
