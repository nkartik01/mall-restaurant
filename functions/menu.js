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
    var workbook = XLSX.readFile("./menus/" + req.params.menu);
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

router.get("/getRestaurantMenus", async (req, res) => {
  try {
    var rests = await db.collection("restaurant").get();
    rests = rests.docs;
    var menus = {};
    for (var k = 0; k < rests.length; k++) {
      var rest = rests[k].data();
      console.log(rest);
      var menu = {};
      for (var l = 0; l < rest.menu.length; l++) {
        console.log(rest.menu[l]);
        var workbook = XLSX.readFile("./menus/" + rest.menu[l]);
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
      }
      console.log(menus);
      menus[rests[k].id] = menu;
    }
    return res.send({ menus });
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
});

router.get("/getTables", async (req, res) => {
  try {
    var tables = await db.collection("table").get();
    tables = tables.docs;
    for (var i = 0; i < tables.length; i++) {
      var table = tables[i].data();
      table.id = tables[i].id;
      tables[i] = table;
    }
    console.log(tables);
    return res.send({ tables: tables });
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
});

router.post("/updateTable", auth_operator, async (req, res) => {
  try {
    var table1 = await db.collection("table").doc(req.body.table.id).get();
    table1 = table1.data();
    table1.orderHistory = req.body.orderHistory;
    await db.collection("table").doc(req.body.table.id).set(table1);
    //add oorder to chef side with timer and stuff
    var chefSide = { order: [] };
    var table = req.body.table;
    chefSide = await db
      .collection("chefSide")
      .doc(table.restaurant + "-" + table.table)
      .get();
    chefSide = chefSide.data();
    if (!chefSide) {
      chefSide = { order: [] };
    }
    chefSide.order.push({ orderTime: Date.now(), order: req.body.orderChange });
    await db
      .collection("chefSide")
      .doc(table.restaurant + "-" + table.table)
      .set(chefSide);
    var chefSide = {};
    res.send("done");
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
});

router.post("/freeTable", auth_operator, async (req, res) => {
  try {
    var chefSide = await db.collection("chefSide").doc(req.body.table.restaurant).get();
    chefSide = chefSide.data();
    if (!!chefSide && chefSide.order.length !== 0) {
      return res.status(400).send("Order not completed from kitchen");
    }
    await db
      .collection("table")
      .doc(req.body.table.id)
      .update({ orderHistory: { order: [], sum: 0 } });
    res.send("Done");
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
});

module.exports = router;
