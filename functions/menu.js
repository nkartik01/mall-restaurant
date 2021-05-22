const express = require("express");
const router = express.Router();
const auth_admin = require("./middleware/auth_admin");
const auth_operator = require("./middleware/auth_operator");
const fs = require("fs");
const XLSX = require("xlsx");
const { table } = require("console");
const Menu = require("./models/Menu");
const Restaurant = require("./models/Restaurant");
const Table = require("./models/Table");
const Bill = require("./models/Bill");
const ChefSide = require("./models/ChefSide");
router.get("/listMenusFromFolder", async (req, res) => {
  try {
    return res.send({ menus: fs.readdirSync("./menus") });
  } catch (err) {
    console.log(err);
    res.status(500).send(err.toString());
  }
});

router.get("/listMenus", async (req, res) => {
  try {
    var menus = await Menu.find({});
    for (var i = 0; i < menus.length; i++) {
      menus[i] = menus[i].toJSON();
      menus[i] = menus[i].menuId;
    }
    res.send({ menus: menus });
  } catch (err) {
    console.log(err);
    res.status(500).send(err.toString());
  }
});

router.post("/setMenu/:menu", async (req, res) => {
  try {
    var workbook = XLSX.readFile("./menus/" + req.params.menu);
    var menu = {};
    var sheets = workbook.SheetNames;
    for (var i = 0; i < sheets.length; i++) {
      var worksheet = workbook.Sheets[sheets[i]];
      var ref = worksheet["!ref"];
      ref = ref.split(":");
      console.log(ref);
      var x1 = ref[1].match(/(\d+)/)[0];
      console.log(sheets[i]);
      sheets[i] = sheets[i].replace(/"."/g, "");
      console.log(sheets[i]);
      menu[sheets[i]] = [];
      for (var j = 1; j <= x1; j++) {
        try {
          menu[sheets[i]].push({
            name: worksheet["A" + j].v,
            price: worksheet["B" + j].v,
            // description: worksheet["C" + j].v,
          });
        } catch (err) {
          console.log(err);
        }
      }
    }
    var id = req.params.menu;
    var x = await Menu.findOne({ menuId: id });
    if (!x)
      new Menu({
        menuId: id,
        menu,
        order: sheets,
        kot: req.body.kot,
        disc: req.body.disc,
        counterName: req.body.counterName,
      }).save();
    else
      (
        await Menu.findOneAndUpdate(
          { menuId: id },
          {
            menuId: id,
            menu,
            order: sheets,
            kot: req.body.kot,
            disc: req.body.disc,
            counterName: req.body.counterName,
          },
          { useFindAndModify: false }
        )
      ).save();
    return res.send(menu);
  } catch (err) {
    console.log(err);
    return res.status(500).send(err.toString());
  }
});

router.get("/getRestaurantMenus", async (req, res) => {
  try {
    var rests = await Restaurant.find({});
    var menus = {};
    for (var i = 0; i < rests.length; i++) {
      var rest = rests[i].toJSON();
      var menu = [];
      for (var j = 0; j < rest.menu.length; j++) {
        var menu1 = (await Menu.findOne({ menuId: rest.menu[j] })).toJSON();
        menu1.id = menu1.menuId;
        menu.push(menu1);
      }
      menus[rest.restaurantId] = menu;
    }
    return res.send({ menus });
  } catch (err) {
    console.log(err);
    res.status(500).send(err.toString());
  }
});

router.get("/addRestaurant/:name", auth_admin, async (req, res) => {
  try {
    var rest = await Restaurant.findOne({ restaurantId: req.params.name });
    if (!!rest) {
      return res.status(400).send("Restaurant Already Exists");
    }
    new Restaurant({ restaurantId: req.params.name, menu: [] }).save();
    res.send("Added");
  } catch (err) {
    console.log(err);
    res.status(500).send(err.toString());
  }
});

router.get("/restaurants", async (req, res) => {
  try {
    var rests = await Restaurant.find({});
    for (var i = 0; i < rests.length; i++) {
      rests[i] = rests[i].toJSON();
      rests[i].id = rests[i].restaurantId;
    }
    res.send({ restaurants: rests });
  } catch (err) {
    console.log(err);
    res.status(500).send(err.toString());
  }
});

router.get("/getTables", async (req, res) => {
  try {
    // var tables = await db.collection("table").orderBy("table", "asc").orderBy("restaurant", "asc").get();
    var tables = await Table.find({}).sort("table").sort("restaurant");
    for (var i = 0; i < tables.length; i++) {
      tables[i] = tables[i].toJSON();
      tables[i].id = tables[i].tableId;
    }
    return res.send({ tables: tables });
  } catch (err) {
    console.log(err);
    res.status(500).send(err.toString());
  }
});

router.post("/updateTable", auth_operator, async (req, res) => {
  try {
    var table1 = (await Table.findOne({ tableId: req.body.table.id })).toJSON();
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
    // console.log(table1, table1.restaurant);
    if (!table1.bill || table1.bill === "") {
      table1.orderSnippets = [];
      var bills = await Bill.find({ restaurant: table1.restaurant });
      var bill = await new Bill({
        billId: prefix + (bills.length + 1).toString(),
        restaurant: table1.restaurant,
        table: table1.table,
        orderChanges: [],
        balance: 0,
        at,
        transactions: [],
        finalOrder: { order: [], sum: 0 },
      }).save();
      table1.bill = prefix + (bills.length + 1).toString();
    }
    // console.log(table1.bill);
    var bill = (await Bill.findOne({ billId: table1.bill })).toJSON();
    bill.balance = bill.balance + req.body.orderChange.sum;
    table1.balance = bill.balance;
    var start = new Date();
    start.setHours(0, 0, 0, 0);
    start = start.valueOf();
    var end = new Date();
    end.setHours(23, 59, 59, 999);
    end = end.valueOf();
    var orders = await ChefSide.count({
      at: { $gte: start, $lt: end },
      restaurant: table1.restaurant,
    });
    req.body.orderChange.orderNo = (orders + 1).toString();
    bill.orderChanges.push(req.body.orderChange);
    bill.finalOrder = req.body.orderHistory;
    (await Bill.findOneAndReplace({ billId: table1.bill }, bill)).save();
    table1.orderSnippets.push(req.body.orderChange);
    (
      await Table.findOneAndReplace({ tableId: req.body.table.id }, table1)
    ).save();
    //add oorder to chef side with timer and stuff
    Object.keys(req.body.chefBreakDown).map((order) => {
      new ChefSide({
        chefSideId: prefix + (orders + 1).toString(),
        ...req.body.chefBreakDown[order],
        at,
        restaurant: table1.restaurant,
        bill: table1.bill,
        orderNo: (orders + 1).toString(),
        menuId: order.split(".")[0],
      }).save();
    });
    res.send({ bill: table1.bill, orderId: (orders + 1).toString() });
  } catch (err) {
    console.log(err);
    res.status(500).send(err.toString());
  }
});

router.post("/freeTable", auth_operator, async (req, res) => {
  try {
    (
      await Table.findOneAndUpdate(
        { tableId: req.body.table.id },
        {
          orderHistory: { order: [], sum: 0 },
          orderSnippets: [],
          bill: "",
          balance: 0,
          discType: false,
          discAmount: 0,
        },
        { useFindAndModify: false }
      )
    ).save();
    res.send("Done");
  } catch (err) {
    console.log(err);
    res.status(500).send(err.toString());
  }
});

router.get("/createTables", async (req, res) => {
  var restaurants = ["Urban Food Court", "Perry Club"];
  // var restaurants = ["Pizzaria", "Dosa Counter", "Juice Bar", "Umega Hotel"];
  // var tables = await db.collection("table").get();
  // tables = tables.docs;
  // for (var i = 0; i < tables.length; i++) {
  //   db.collection("table").doc(tables[i].id).delete();
  // }
  for (var i = 0; i < 2; i++) {
    for (var j = 0; j < 15; j++) {
      new Table({
        orderHistory: { order: [], sum: 0 },
        orderSnippets: [],
        balance: 0,
        bill: "",
        restaurant: restaurants[i],
        table: "Table" + ("0" + (j + 1)).slice(-2),
        tableId: restaurants[i] + "-" + "Table" + ("0" + (j + 1)).slice(-2),
      }).save();
    }
  }
  res.send("done");
});

router.post("/addTable", async (req, res) => {
  try {
    var table = await Table.findOne({
      tableId: req.body.restaurant + "-" + req.body.table,
    });
    if (table) {
      return res.status(400).send("Table already exists");
    }

    new Table({
      orderHistory: { order: [], sum: 0 },
      orderSnippets: [],
      balance: 0,
      bill: "",
      restaurant: req.body.restaurant,
      table: req.body.table,
      tableId: req.body.restaurant + "-" + req.body.table,
    }).save();
    return res.send("Done");
  } catch (err) {
    console.log(err);
    res.status(500).send(err.toString());
  }
});

router.delete("/table", async (req, res) => {
  try {
    console.log(req.body);
    var table = await Table.findOne({
      tableId: req.body.restaurant + "-" + req.body.table,
    });
    console.log(table);
    if (!table) {
      return res.status(400).send("Table doesn't exist");
    }

    (await table.remove()).save();
    return res.send("Done");
  } catch (err) {
    console.log(err);
    res.status(500).send(err.toString());
  }
});

router.post("/toggleMenu", async (req, res) => {
  try {
    var restaurant = await Restaurant.findOne({
      restaurantId: req.body.restaurant,
    });
    if (!restaurant) {
      return res.status(400).send("Restaurant Not Found");
    }
    restaurant = restaurant.toJSON();
    var index = restaurant.menu.indexOf(req.body.menu);
    if (index === -1) {
      restaurant.menu.push(req.body.menu);
      (
        await Restaurant.findOneAndUpdate(
          { restaurantId: req.body.restaurant },
          restaurant,
          { useFindAndModify: false }
        )
      ).save();
      return res.send("Added " + req.body.menu + " to " + req.body.restaurant);
    } else {
      restaurant.menu.splice(index, 1);
      console.log(restaurant);
      (
        await Restaurant.findOneAndUpdate(
          { restaurantId: req.body.restaurant },
          restaurant,
          { useFindAndModify: false }
        )
      ).save();
      return res.send(
        "Removed " + req.body.menu + " from " + req.body.restaurant
      );
    }
  } catch (err) {
    console.log(err);
    res.status(500).send(err.toString());
  }
});

module.exports = router;
