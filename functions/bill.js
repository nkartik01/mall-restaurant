const express = require("express");
const router = express.Router();
const admin = require("firebase-admin");
const db = admin.firestore();
const auth_admin = require("./middleware/auth_admin");
const auth_operator = require("./middleware/auth_operator");
const ThermalPrinter = require("node-thermal-printer").printer;
const PrinterTypes = require("node-thermal-printer").types;
const printer = require("printer");
router.get("/listBills/:x", async (req, res) => {
  try {
    var x = parseInt(req.params.x);
    var bills = await db.collection("bill").orderBy("at", "desc").limit(x).get();
    bills = bills.docs;
    bills = bills.filter((bill, ind) => {
      if (ind < x) {
        return true;
      }
      return false;
    });
    for (ind = 0; ind < bills.length; ind++) {
      var bill1 = bills[ind].data();
      bill1.id = bills[ind].id;
      bills[ind] = bill1;
    }
    res.send({ bills: bills });
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
});

router.get("/getBill/:id", async (req, res) => {
  try {
    var bill = await db.collection("bill").doc(req.params.id).get();
    bill = bill.data();
    bill.id = req.params.id;
    if (!bill) {
      return res.status(400).send("Bill not found");
    }
    res.send({ bill });
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
});

router.get("/pendingBills", auth_operator, async (req, res) => {
  try {
    var x = parseInt(req.params.x);
    var bills = await db.collection("bill").where("balance", "!=", 0).orderBy("balance", "desc").orderBy("at", "desc").get();
    bills = bills.docs;
    for (ind = 0; ind < bills.length; ind++) {
      var bill1 = bills[ind].data();
      bill1.id = bills[ind].id;
      bills[ind] = bill1;
    }
    res.send({ bills: bills });
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
});

router.post("/byCash", auth_operator, async (req, res) => {
  try {
    if (req.body.amount < 0) {
      return res.status(400).send("Negetive amount not allowed.");
    }
    var now = Date.now();
    var bill = await db.collection("bill").doc(req.body.bill).get();
    bill = bill.data();

    if (!bill) {
      return res.status(400).send("Issue with Bill");
    }
    if (!bill.transactions) {
      bill.transactions = [];
    }
    if (req.body.to) {
      bill.to = req.body.to;
    }
    bill.balance = bill.balance - req.body.amount;
    if (req.body.table) {
      db.collection("table").doc(req.body.table).update({ balance: bill.balance });
    }
    bill.transactions.unshift({ type: "cash", by: req.operator.id, at: now, amount: req.body.amount });

    var operator = await db.collection("operator").doc(req.operator.id).get();
    operator = operator.data();
    if (!operator.balance) {
      operator.balance = 0;
    }
    operator.balance = operator.balance + req.body.amount;
    db.collection("bill").doc(req.body.bill).set(bill);
    db.collection("operator").doc(req.operator.id).set(operator);
    res.send("Paid");
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
});

router.post("/byCard", auth_operator, async (req, res) => {
  try {
    if (req.body.amount < 0) {
      return res.status(400).send("Negetive amount not allowed.");
    }
    var now = Date.now();
    var bill = await db.collection("bill").doc(req.body.bill).get();
    bill = bill.data();

    if (!bill) {
      return res.status(400).send("Issue with Bill");
    }
    if (!bill.transactions) {
      bill.transactions = [];
    }
    if (req.body.to) {
      bill.to = req.body.to;
    }
    bill.balance = bill.balance - req.body.amount;
    if (req.body.table) {
      db.collection("table").doc(req.body.table).update({ balance: bill.balance });
    }
    bill.transactions.unshift({ type: "cardSwipe", by: req.operator.id, at: now, amount: req.body.amount, tranId: req.body.tranId });

    var operator = await db.collection("operator").doc(req.operator.id).get();
    operator = operator.data();
    if (!operator.balance) {
      operator.balance = 0;
    }
    if (!operator.cardSwipes) {
      operator.cardSwipes = [];
    }

    operator.cardSwipes.push({ at: now, tranId: req.body.tranId, amount: req.body.amount, bill: req.body.bill });
    db.collection("bill").doc(req.body.bill).set(bill);
    db.collection("operator").doc(req.operator.id).set(operator);
    res.send("Paid");
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
});

router.post("/byUpi", auth_operator, async (req, res) => {
  try {
    if (req.body.amount < 0) {
      return res.status(400).send("Negetive amount not allowed.");
    }
    var now = Date.now();
    var bill = await db.collection("bill").doc(req.body.bill).get();
    bill = bill.data();

    if (!bill) {
      return res.status(400).send("Issue with Bill");
    }
    if (!bill.transactions) {
      bill.transactions = [];
    }
    if (req.body.to) {
      bill.to = req.body.to;
    }
    bill.balance = bill.balance - req.body.amount;
    if (req.body.table) {
      db.collection("table").doc(req.body.table).update({ balance: bill.balance });
    }
    bill.transactions.unshift({ type: "upi", by: req.operator.id, at: now, amount: req.body.amount, tranId: req.body.tranId });

    var operator = await db.collection("operator").doc(req.operator.id).get();
    operator = operator.data();
    if (!operator.balance) {
      operator.balance = 0;
    }
    if (!operator.upiPays) {
      operator.upiPays = [];
    }

    operator.upiPays.push({ at: now, tranId: req.body.tranId, amount: req.body.amount, bill: req.body.bill });
    db.collection("bill").doc(req.body.bill).set(bill);
    db.collection("operator").doc(req.operator.id).set(operator);
    res.send("Paid");
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
});

router.post("/printBill", async (req, res) => {
  try {
    const ThermalPrinter = require("node-thermal-printer").printer;
    const PrinterTypes = require("node-thermal-printer").types;
    const electron = typeof process !== "undefined" && process.versions && !!process.versions.electro;
    console.log(req.body.printer);
    let print = new ThermalPrinter({
      type: PrinterTypes.EPSON, // Printer type: 'star' or 'epson'
      interface: "printer:" + req.body.printer, // Printer interface
      // interface: "printer:Microsoft Print to PDF",
      driver: require(electron ? "electron-printer" : "printer"),
    });
    console.log(1);
    let isConnected = await print.isPrinterConnected(); // Check if print is connected, return bool of status
    console.log(isConnected);
    print.alignCenter();
    print.setTextSize(1, 1);
    print.println("Urban Food Court");
    print.setTextSize(0, 0);
    print.println("City Walk Mall, Hanumangarh Road, Abohar");
    print.println("A Unit of RDESCO City Walk Pvt. Ltd.");
    print.newLine();
    // print.println("Hanumangarh Road, Abohar");
    print.leftRight("GSTIN: 03AAICR8822Q1ZS", "FSSAI: 12119201000010");
    // print.println("GSTIN: 03AAICR8822Q1ZS");
    // print.println("FSSAI: 12119201000010");
    if (req.body.preview) {
      print.println("Bill Preview");
    }
    print.newLine();
    print.leftRight("Bill No. :" + req.body.bill, "Date: " + new Date(Date.now()).toLocaleDateString());
    if (!req.body.preview) print.leftRight("Method: " + req.body.method, "Time: " + new Date(Date.now()).toLocaleTimeString());
    if (!req.body.preview)
      if (req.body.method === "rfid") {
        print.println("Card No.: " + req.body.uid);
      } else if (req.body.method !== "cash") {
        print.println("Txn Id: " + req.body.tranId);
      }
    print.drawLine();
    print.tableCustom([
      { text: "Sr.", width: 0.08, align: "LEFT" },
      { text: "Item", width: 0.4, align: "LEFT" },
      { width: 0.13, text: "Price", align: "RIGHT" },
      { text: "Qty", width: 0.1, align: "RIGHT" },
      { text: "Amount", width: 0.19, align: "RIGHT" },
    ]);
    // print.table(["Sr. No.", "Item", "Price", "Quantity", "Amount"]);
    print.drawLine();
    req.body.orderHistory.order.map((order, i) => {
      return print.tableCustom([
        { text: i + 1, width: 0.08 },
        { text: order.item, width: 0.4 },
        { text: order.price, width: 0.13, align: "RIGHT" },
        { text: order.quantity, width: 0.1, align: "RIGHT" },
        { text: order.price * order.quantity, width: 0.19, align: "RIGHT" },
      ]);
      // return print.table([i + 1, order.item, order.price, order.quantity, order.price * order.quantity]);
    });
    print.drawLine();

    print.leftRight("", "Total: " + req.body.orderHistory.sum + " ");
    // logic for tax
    var bill = await db.collection("bill").doc(req.body.bill).get();
    bill = bill.data();
    if (!bill.discAmount) bill.discAmount = 0;
    if (bill.discAmount && bill.discAmount > 0) print.leftRight("", "Discount: " + bill.discAmount + " ");
    console.log("hi", parseInt(req.body.orderHistory.sum - parseInt(parseInt(req.body.balance) + parseInt(bill.discAmount))));
    if (parseInt(req.body.orderHistory.sum - parseInt(parseInt(req.body.balance) + parseInt(bill.discAmount))) !== 0)
      print.leftRight("", "Already Paid: " + parseInt(req.body.orderHistory.sum - parseInt(parseInt(req.body.balance) + parseInt(bill.discAmount))).toString() + " ");
    if (req.body.orderHistory.sum !== req.body.balance) print.leftRight("", "Amount to be paid: " + req.body.balance + " ");
    if (!req.body.preview) {
      print.leftRight("", "Amount Recieved: " + parseInt(req.body.paid) + " ");
      if (req.body.balance - req.body.paid !== 0) print.leftRight("", "Pending: " + parseInt(parseInt(req.body.balance) - parseInt(req.body.paid)) + " ");
    }
    // print.println("hello");
    print.newLine();
    print.println("Thanks for coming. We hope to see you again soon.");
    print.cut();
    let execute = await print.execute(); // Executes all the commands. Returns success or throws error
    console.log(execute);
    return res.send({ execute });
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
});

router.post("/printOrder", async (req, res) => {
  try {
    const ThermalPrinter = require("node-thermal-printer").printer;
    const PrinterTypes = require("node-thermal-printer").types;
    const electron = typeof process !== "undefined" && process.versions && !!process.versions.electro;
    console.log(req.body.printer);
    let print = new ThermalPrinter({
      type: PrinterTypes.EPSON, // Printer type: 'star' or 'epson'
      interface: "printer:" + req.body.printer, // Printer interface
      // interface: "printer:Microsoft Print to PDF",
      driver: require(electron ? "electron-printer" : "printer"),
    });
    console.log(1);
    let isConnected = await print.isPrinterConnected(); // Check if print is connected, return bool of status
    // console.log(isConnected);
    print.alignCenter();

    print.setTextSize(1, 1);
    print.println("Urban Food Court");
    print.setTextSize(0, 0);
    print.println("City Walk Mall, Hanumangarh Road, Abohar");
    print.newLine();
    print.leftRight("GSTIN: 03AAICR8822Q1ZS", "FSSAI: 12119201000010");
    print.println("A Unit of RDESCO City Walk Pvt. Ltd.");

    print.newLine();

    print.leftRight("Bill No. : " + req.body.bill, "Date: " + new Date(Date.now()).toLocaleDateString());
    print.leftRight("", "Time: " + new Date(Date.now()).toLocaleTimeString());
    if (req.body.method === "card") {
      print.println("Card No.: " + req.body.uid);
    }
    print.drawLine();
    print.tableCustom([
      { text: "Sr.", width: 0.08, align: "LEFT" },
      { text: "Item", width: 0.4, align: "LEFT" },
      { width: 0.13, text: "Price", align: "RIGHT" },
      { text: "Qty", width: 0.1, align: "RIGHT" },
      { text: "Amount", width: 0.19, align: "RIGHT" },
    ]);
    print.drawLine();
    req.body.order.order.map((order, i) => {
      return print.tableCustom([
        { text: i + 1, width: 0.08 },
        { text: order.item, width: 0.4 },
        { text: order.price, width: 0.13, align: "RIGHT" },
        { text: order.quantity, width: 0.1, align: "RIGHT" },
        { text: order.price * order.quantity, width: 0.19, align: "RIGHT" },
      ]);
    });
    print.drawLine();

    print.leftRight("", "Total: " + req.body.order.sum + " ");
    // logic for tax
    print.print("Your Order No. is: ");
    print.setTextSize(1, 1);
    print.println(req.body.orderId);
    print.setTextSize(0, 0);
    print.cut();
    let execute = await print.execute(); // Executes all the commands. Returns success or throws error
    console.log(execute);
    return res.send({ execute });
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
});

router.post("/addDiscount", auth_operator, async (req, res) => {
  try {
    var bill = await db.collection("bill").doc(req.body.bill).get();
    bill = bill.data();
    if (!bill) {
      return res.status(400), send("Bill not found");
    }
    if (bill.discType && bill.discType !== "none") {
      bill.balance = bill.balance + bill.discAmount;
    }
    bill.discType = req.body.discType;
    bill.discBy = req.operator.id;
    bill.balance = bill.balance - req.body.discAmount;
    bill.discReason = req.body.discReason;
    bill.discAmount = req.body.discAmount;
    if (req.body.table) {
      console.log(req.body.table);
      var table = await db.collection("table").doc(req.body.table).get();

      table = table.data();
      if (table.discType && table.discType !== "none") {
        table.balance = table.balance + table.discAmount;
      }
      table.discType = req.body.discType;
      table.discBy = req.operator.id;
      table.balance = table.balance - req.body.discAmount;
      table.discReason = req.body.discReason;
      table.discAmount = req.body.discAmount;
      db.collection("table").doc(req.body.table).set(table);
    }
    db.collection("bill").doc(req.body.bill).set(bill);
    res.send("Discount Applied");
  } catch (err) {
    console.log(err, err.response);
    res.status(500).send(err);
  }
});

router.get("/printers", auth_admin, async (req, res) => {
  var printers = printer.getPrinters();
  console.log(printers);
  res.send({ printers });
});

router.get("/clearBills", async (req, res) => {
  var bills = await db.collection("table").get();
  bills = bills.docs;
  for (var i = 0; i < bills.length; i++) {
    db.collection("table").doc(bills[i].id).delete();
  }
});
module.exports = router;
