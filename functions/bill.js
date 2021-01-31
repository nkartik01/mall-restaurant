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
    print.println("City Walk Mall, Abohar");
    print.newLine();
    print.leftRight("Bill: " + req.body.bill, "Date: " + new Date(Date.now()).toLocaleDateString());
    print.leftRight("Method: " + req.body.method, "Time: " + new Date(Date.now()).toLocaleTimeString());
    if (req.body.method === "card") {
      print.println("Card No.: " + req.body.uid);
    }
    print.drawLine();
    print.tableCustom([
      { text: "Sr.", width: 0.1 },
      { text: "Item", width: 0.4 },
      { width: 0.15, text: "Price" },
      { text: "Quantity", width: 0.17 },
      { text: "Amount", width: 0.18 },
    ]);
    // print.table(["Sr. No.", "Item", "Price", "Quantity", "Amount"]);
    print.drawLine();
    req.body.orderHistory.order.map((order, i) => {
      return print.tableCustom([
        { text: i + 1, width: 0.1 },
        { text: order.item, width: 0.4 },
        { text: order.price, width: 0.2 },
        { text: order.quantity, width: 0.1 },
        { text: order.price * order.quantity, width: 0.2 },
      ]);
      // return print.table([i + 1, order.item, order.price, order.quantity, order.price * order.quantity]);
    });
    print.drawLine();
    print.table(["", "", "", "", req.body.orderHistory.sum]);

    // logic for tax

    if (req.body.orderHistory.sum - req.body.balance !== 0) print.leftRight("", "Already Paid: " + (req.body.orderHistory.sum - req.body.balance));
    print.leftRight("", "Balance: " + req.body.balance);
    print.leftRight("", "Recieved: " + parseInt(req.body.paid));
    if (req.body.balance - req.body.paid !== 0) print.leftRight("", "Pending: " + parseInt(parseInt(req.body.balance) - parseInt(req.body.paid)));
    print.partialCut();

    // print.println("hello");

    // print.cut();
    let execute = await print.execute(); // Executes all the commands. Returns success or throws error
    console.log(execute);
    return res.send({ execute });
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
});

router.get("/printers", auth_admin, async (req, res) => {
  var printers = printer.getPrinters();
  console.log(printers);
  res.send({ printers });
});

module.exports = router;
