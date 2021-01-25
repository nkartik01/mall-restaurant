const express = require("express");
const router = express.Router();
const admin = require("firebase-admin");
const db = admin.firestore();
const auth_admin = require("./middleware/auth_admin");
const auth_operator = require("./middleware/auth_operator");
const fs = require("fs");
const XLSX = require("xlsx");
router.get("/listMenus", async (req, res) => {
  try {
    return res.send({ menus: fs.readdirSync("./menus") });
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
});

router.get("/getItems/:menu", async (req, res) => {
  try {
    var workbook = XLSX.readFile("./menus/" + req.params.menu + ".xlsx");
    var menu = {};
    var sheets = workbook.SheetNames;
    for (var i = 0; i < sheets.length; i++) {
      console.log(sheets);
      var worksheet = workbook.Sheets[sheets[i]];
      var ref = worksheet["!ref"];

      ref = ref.split(":");
      var x1 = ref[1].match(/(\d+)/)[0];
      console.log(worksheet);
      menu[sheets[i]] = [];
      for (var j = 1; j <= x1; j++) {
        menu[sheets[i]].push({
          name: worksheet["A" + j].v,
          price: worksheet["B" + j].v,
          description: worksheet["C" + j].v,
        });
      }
    }
    return res.send(menu);
  } catch (err) {
    console.log(err);
    return res.status(500).send(err);
  }
});

module.exports = router;
