const express = require("express");
const router = express.Router();
const admin = require("firebase-admin");
const db = admin.firestore();
const auth_admin = require("./middleware/auth_admin");
const auth_operator = require("./middleware/auth_operator");
const fs = require("fs");
const XLSX = require("xlsx");
const { table } = require("console");
router.get("/listMenus", async (req, res) => {
  try {
    return res.send({ menus: fs.readdirSync("./menus") });
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
});

router.get("/setMenu/:menu", async (req, res) => {
  try {
    var workbook = XLSX.readFile("./menus/" + req.params.menu);
    var menu = {};
    var sheets = workbook.SheetNames;
    for (var i = 0; i < sheets.length; i++) {
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
          // description: worksheet["C" + j].v,
        });
      }
    }
    db.collection("menu").doc(req.params.menu).set(menu);
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
      var menu = {};
      for (var l = 0; l < rest.menu.length; l++) {
        menu = await db.collection("menu").doc(rest.menu[l]).get();
        menu = menu.data();
      }
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
    var tables = await db.collection("table").orderBy("table", "asc").orderBy("restaurant", "asc").get();
    tables = tables.docs;
    for (var i = 0; i < tables.length; i++) {
      var table = tables[i].data();
      table.id = tables[i].id;
      tables[i] = table;
    }
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
    var at = Date.now();
    req.body.orderChange.at = at;
    table1.orderHistory = req.body.orderHistory;
    var prefix =
      table1.restaurant === "Urban Food Court"
        ? "UFC-"
        : table1.restaurant === "Perry Club"
        ? "PC-"
        : table1.restaurant === "Pizzaria"
        ? "PZ-"
        : table1.restaurant === "Dosa Counter"
        ? "DC-"
        : table1.restaurant === "Juice Bar"
        ? "JB-"
        : table1.restaurant === "Umega Hotel"
        ? "UH-"
        : null;

    if (!table1.orderSnippets || table1.orderSnippets.length === 0) {
      table1.orderSnippets = [];
      var bills = await db.collection("bill").where("restaurant", "==", table1.restaurant).get();
      bills = bills.docs;
      var bill = await db
        .collection("bill")
        .doc(prefix + (bills.length + 1).toString())
        .set({ restaurant: table1.restaurant, table: table1.table, orderChanges: [], balance: 0, at });
      table1.bill = prefix + (bills.length + 1).toString();
    }
    var bill = await db.collection("bill").doc(table1.bill).get();
    bill = bill.data();
    bill.balance = bill.balance + req.body.orderChange.sum;
    table1.balance = bill.balance;
    bill.orderChanges.push(req.body.orderChange);
    bill.finalOrder = req.body.orderHistory;
    db.collection("bill").doc(table1.bill).set(bill);
    table1.orderSnippets.push(req.body.orderChange);
    db.collection("table").doc(req.body.table.id).set(table1);
    //add oorder to chef side with timer and stuff
    var start = new Date();
    start.setHours(0, 0, 0, 0);
    start = start.valueOf();
    var end = new Date();
    end.setHours(23, 59, 59, 999);
    end = end.valueOf();
    var orders = await db.collection("chefSide").where("at", ">=", start).where("at", "<=", end).where("restaurant", "==", table1.restaurant).get();
    orders = orders.docs;

    db.collection("chefSide")
      .doc(prefix + (orders.length + 1).toString())
      .set({ ...req.body.orderChange, restaurant: table1.restaurant });
    res.send({ bill: table1.bill, orderId: (orders.length + 1).toString() });
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
});

router.post("/freeTable", auth_operator, async (req, res) => {
  try {
    // var chefSide = await db.collection("chefSide").doc(req.body.table.restaurant).get();
    // chefSide = chefSide.data();
    // if (
    //   !!chefSide &&
    //   chefSide.order.filter((obj, i) => {
    //     if (obj.status === "made") return false;
    //     return true;
    //   }).length !== 0
    // ) {
    //   return res.status(400).send("Order not completed from kitchen");
    // }
    await db
      .collection("table")
      .doc(req.body.table.id)
      .update({ orderHistory: { order: [], sum: 0 }, orderSnippets: [], bill: "", balance: 0, discType: false, discAmount: 0 });
    res.send("Done");
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
});

router.get("/createTables", async (req, res) => {
  // var restaurants = ["Urban Food Court", "Perry Club"];
  var restaurants = ["Pizzaria", "Dosa Counter", "Juice Bar", "Umega Hotel"];
  // var tables = await db.collection("table").get();
  // tables = tables.docs;
  // for (var i = 0; i < tables.length; i++) {
  //   db.collection("table").doc(tables[i].id).delete();
  // }
  // for (var i = 0; i < 3; i++) {
  for (var j = 0; j < 25; j++) {
    db.collection("table").add({ orderHistory: { order: [], sum: 0 }, orderSnippets: [], balance: 0, bill: "", restaurant: restaurants[3], table: "room" + (j + 1) });
  }
  // }
  res.send("done");
});

module.exports = router;
