const express = require("express");
const router = express.Router();
const admin = require("firebase-admin");
const db = admin.firestore();
const auth_admin = require("./middleware/auth_admin");
const auth_operator = require("./middleware/auth_operator");

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
    operator = operator.get();
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

router.post("/printBill", async (req, res) => {
  try {
    const ThermalPrinter = require("node-thermal-printer").printer;
    const PrinterTypes = require("node-thermal-printer").types;
    const electron = typeof process !== "undefined" && process.versions && !!process.versions.electro;
    let printer = new ThermalPrinter({
      type: PrinterTypes.EPSON, // Printer type: 'star' or 'epson'
      interface: "printer:TH400II", // Printer interface
      driver: require(electron ? "electron-printer" : "printer"),
    });
    console.log(1);
    let isConnected = await printer.isPrinterConnected(); // Check if printer is connected, return bool of status
    console.log(isConnected);
    printer.alignCenter();
    printer.setTextSize(1, 1);
    printer.println("Urban Food Court");
    printer.setTextSize(0, 0);
    printer.println("City Walk Mall, Abohar");
    printer.newLine();
    printer.leftRight("Bill: " + req.body.bill, "Date: " + new Date(Date.now()).toLocaleDateString());
    printer.leftRight("", "Time: " + new Date(Date.now()).toLocaleTimeString());
    printer.drawLine();
    printer.table(["Sr. No.", "Item", "Price", "Quantity", "Amount"]);
    printer.drawLine();
    req.body.orderHistory.order.map((order, i) => {
      return printer.table([i + 1, order.item, order.price, order.quantity, order.price * order.quantity]);
    });
    printer.drawLine();
    printer.table(["", "", "", "", req.body.orderHistory.sum]);

    // logic for tax

    printer.leftRight("", "Already Paid: " + (req.body.orderHistory.sum - req.body.balance));
    printer.leftRight("", "Balance: " + req.body.balance);
    printer.partialCut();

    // printer.println("hello");

    // printer.cut();
    let execute = await printer.execute(); // Executes all the commands. Returns success or throws error
    console.log(execute);
    return res.send({ execute });
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
});

module.exports = router;
