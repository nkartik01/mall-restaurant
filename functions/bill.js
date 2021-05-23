const express = require("express");
const router = express.Router();
const auth_admin = require("./middleware/auth_admin");
const auth_operator = require("./middleware/auth_operator");
const ThermalPrinter = require("node-thermal-printer").printer;
const PrinterTypes = require("node-thermal-printer").types;
const printer = require("printer");
const Bill = require("./models/Bill");
const Table = require("./models/Table");
const OperatorTransaction = require("./models/OperatorTransaction");
router.post("/listBills", async (req, res) => {
  try {
    // console.log(new Date(req.body.start).setHours(0, 0, 0, 0).valueOf(), new Date(req.body.end).setHours(23, 59, 59, 999).valueOf());
    var bills = await Bill.find({
      at: {
        $gte: new Date(req.body.start).setHours(0, 0, 0, 0).valueOf(),
        $lt: new Date(req.body.end).setHours(23, 59, 59, 999).valueOf(),
      },
    }).sort({
      at: -1,
    });
    for (ind = 0; ind < bills.length; ind++) {
      bills[ind] = bills[ind].toJSON();
      bills[ind].id = bills[ind].billId;
      // console.log(bills[ind]);
    }
    res.send({ bills: bills });
  } catch (err) {
    console.log(err);
    res.status(500).send(err.toString());
  }
});

router.get("/getBill/:id", async (req, res) => {
  try {
    var bill = await Bill.findOne({ billId: req.params.id });
    if (!bill) {
      return res.status(400).send("Bill not found");
    }
    bill = bill.toJSON();
    bill.id = req.params.id;
    res.send({ bill });
  } catch (err) {
    console.log(err);
    res.status(500).send(err.toString());
  }
});

router.get("/pendingBills", auth_operator, async (req, res) => {
  try {
    var x = parseInt(req.params.x);
    var bills = await Bill.find({ balance: { $ne: 0 } }).sort({
      balance: -1,
      at: -1,
    });
    for (ind = 0; ind < bills.length; ind++) {
      var bill1 = bills[ind].toJSON();
      bill1.id = bills[ind].billId;
      bills[ind] = bill1;
    }
    res.send({ bills: bills });
  } catch (err) {
    console.log(err);
    res.status(500).send(err.toString());
  }
});

router.post("/byCash", auth_operator, async (req, res) => {
  try {
    if (req.body.amount < 0) {
      return res.status(400).send("Negetive amount not allowed.");
    }
    var now = Date.now();
    var bill = await Bill.findOne({ billId: req.body.bill });
    // console.log(req.body);
    if (!bill) {
      return res.status(400).send("Issue with Bill");
    }
    bill = bill.toJSON();
    if (!bill.transactions) {
      bill.transactions = [];
    }
    if (req.body.to) {
      bill.to = req.body.to;
    }
    if (req.body.gstin) {
      bill.gstin = req.body.gstin;
    }
    var table = await Table.findOne({ bill: req.body.bill });
    if (!!table && bill.balance === req.body.amount) {
      table = table.toJSON();
      table.bill = "";
      table.orderHistory = { sum: 0, order: [] };
      table.orderSnippet = [];
      table.balance = 0;
      (await Table.findOneAndReplace({ bill: req.body.bill }, table)).save();
    }
    bill.balance = bill.balance - req.body.amount;
    if (req.body.table) {
      (
        await Table.findOneAndUpdate(
          { tableId: req.body.table },
          { balance: bill.balance },
          { useFindAndModify: false }
        )
      ).save();
    }
    bill.transactions.unshift({
      type: "cash",
      by: req.operator.id,
      at: now,
      amount: req.body.amount,
      gstin: req.body.gstin,
    });
    var operator = (
      await Operator.findOne({ operatorId: req.operator.id })
    ).toJSON();
    if (!operator.balance) {
      operator.balance = 0;
    }
    operator.balance = operator.balance + req.body.amount;
    await new OperatorTransaction({
      type: "cash",
      bill: req.body.bill,
      at: now,
      amount: req.body.amount,
      gstin: req.body.gstin,
      operatorId: req.operator.id,
    }).save();
    (
      await Bill.findOneAndUpdate({ billId: req.body.bill }, bill, {
        useFindAndModify: false,
      })
    ).save();
    (
      await Operator.findOneAndReplace(
        { operatorId: req.operator.id },
        { ...operator },
        { useFindAndModify: false }
      )
    ).save();
    res.send("Paid");
  } catch (err) {
    console.log(err);
    res.status(500).send(err.toString());
  }
});

router.post("/byCard", auth_operator, async (req, res) => {
  try {
    if (req.body.amount < 0) {
      return res.status(400).send("Negetive amount not allowed.");
    }
    var now = Date.now();
    var bill = await Bill.findOne({ billId: req.body.bill });
    if (!bill) {
      return res.status(400).send("Issue with Bill");
    }
    bill = bill.toJSON();
    if (!bill.transactions) {
      bill.transactions = [];
    }
    if (req.body.to) {
      bill.to = req.body.to;
    }
    if (req.body.gstin) {
      bill.gstin = req.body.gstin;
    }
    bill.balance = bill.balance - req.body.amount;
    var table = await Table.findOne({ bill: req.body.bill });
    if (!!table && bill.balance === req.body.amount) {
      table = table.toJSON();
      table.bill = "";
      table.orderHistory = { sum: 0, order: [] };
      table.orderSnippet = [];
      table.balance = 0;
      (await Table.findOneAndReplace({ bill: req.body.bill }, table)).save();
    }
    if (req.body.table) {
      Table.findOneAndUpdate(
        { tableId: req.body.table },
        { balance: bill.balance },
        { useFindAndModify: false }
      );
    }
    bill.transactions.unshift({
      type: "card",
      by: req.operator.id,
      at: now,
      amount: req.body.amount,
      tranId: req.body.tranId,
      gstin: req.body.gstin,
    });

    var operator = (
      await Operator.findOne({ operatorId: req.operator.id })
    ).toJSON();
    if (!operator.balance) {
      operator.balance = 0;
    }
    await new OperatorTransaction({
      at: now,
      tranId: req.body.tranId,
      amount: req.body.amount,
      bill: req.body.bill,
      type: "card",
      gstin: req.body.gstin,
      operatorId: req.operator.id,
    }).save();
    (
      await Bill.findOneAndUpdate({ billId: req.body.bill }, bill, {
        useFindAndModify: false,
      })
    ).save();
    (
      await Operator.findOneAndReplace(
        { operatorId: req.operator.id },
        { ...operator },
        { useFindAndModify: false }
      )
    ).save();
    res.send("Paid");
  } catch (err) {
    console.log(err);
    res.status(500).send(err.toString());
  }
});

router.post("/byUpi", auth_operator, async (req, res) => {
  try {
    if (req.body.amount < 0) {
      return res.status(400).send("Negetive amount not allowed.");
    }
    var now = Date.now();
    var bill = await Bill.findOne({ billId: req.body.bill });

    if (!bill) {
      return res.status(400).send("Issue with Bill");
    }
    bill = bill.toJSON();
    if (!bill.transactions || bill.transactions.length === 0) {
      bill.transactions = [];
    }
    if (req.body.to) {
      bill.to = req.body.to;
    }
    bill.balance = bill.balance - req.body.amount;
    var table = await Table.findOne({ bill: req.body.bill });
    if (!!table && bill.balance === req.body.amount) {
      table = table.toJSON();
      table.bill = "";
      table.orderHistory = { sum: 0, order: [] };
      table.orderSnippet = [];
      table.balance = 0;
      (await Table.findOneAndReplace({ bill: req.body.bill }, table)).save();
    }
    if (req.body.table) {
      (
        await Table.findOneAndUpdate(
          { tableId: req.body.table },
          { balance: bill.balance },
          { useFindAndModify: false }
        )
      ).save();
    }
    bill.transactions.unshift({
      type: "upi",
      by: req.operator.id,
      at: now,
      amount: req.body.amount,
      tranId: req.body.tranId,
      gstin: req.body.gstin,
    });
    // console.log(bill.transactions);
    var operator = (
      await Operator.findOne({ operatorId: req.operator.id })
    ).toJSON();
    if (!operator.balance) {
      operator.balance = 0;
    }
    await new OperatorTransaction({
      at: now,
      tranId: req.body.tranId,
      amount: req.body.amount,
      bill: req.body.bill,
      type: "upi",
      gstin: req.body.gstin,
      operatorId: req.operator.id,
    }).save();
    (
      await Bill.findOneAndReplace({ billId: req.body.bill }, { ...bill })
    ).save();
    (
      await Operator.findOneAndReplace(
        { operatorId: req.operator.id },
        { ...operator }
      )
    ).save();
    res.send("Paid");
  } catch (err) {
    console.log(err);
    res.status(500).send(err.toString());
  }
});

router.post("/printBill", auth_operator, async (req, res) => {
  try {
    const ThermalPrinter = require("node-thermal-printer").printer;
    const PrinterTypes = require("node-thermal-printer").types;
    const electron =
      typeof process !== "undefined" &&
      process.versions &&
      !!process.versions.electro;
    // console.log(req.body.printer);
    let print = new ThermalPrinter({
      type: PrinterTypes.EPSON, // Printer type: 'star' or 'epson'
      interface: "printer:" + req.body.printer, // Printer interface
      // interface: "printer:Microsoft Print to PDF",
      driver: require(electron ? "electron-printer" : "printer"),
    });
    // console.log(1);
    let isConnected = await print.isPrinterConnected(); // Check if print is connected, return bool of status
    // console.log(isConnected);
    print.alignCenter();
    print.setTextSize(1, 1);
    if (req.body.restaurant === "Perry Club") print.println("Urban Food Court");
    else print.println(req.body.restaurant);
    print.setTextSize(0, 0);
    print.println("City Walk Mall, Hanumangarh Road, Abohar");
    print.println("A Unit of RDESCO City Walk Pvt. Ltd.");

    // print.println("Hanumangarh Road, Abohar");
    print.leftRight("GSTIN: 03AAICR8822Q1ZS", "FSSAI: 12119201000010");

    if (req.body.preview) {
      print.newLine();
      print.println("Bill Preview");
    }
    print.newLine();
    var bill = (await Bill.findOne({ billId: req.body.bill })).toJSON();
    print.leftRight(
      "Bill No. :" + req.body.bill,
      "Date: " + new Date(bill.at).toLocaleDateString("en-GB")
    );
    if (!req.body.preview)
      print.leftRight("", "Time: " + new Date(bill.at).toLocaleTimeString());
    if (bill.to && bill.to !== "") {
      print.newLine();
      print.bold(true);
      print.leftRight("Bill to:", "");
      print.bold(false);
      print.leftRight("Name: " + bill.to, "");
      if (bill.gstin && bill.gstin !== "") {
        print.leftRight("GSTIN: " + bill.gstin, "");
      }
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
      print.tableCustom([
        { text: i + 1, width: 0.08 },
        { text: order.item, width: 0.4 },
        { text: order.price, width: 0.13, align: "RIGHT" },
        { text: order.quantity, width: 0.1, align: "RIGHT" },
        { text: order.price * order.quantity, width: 0.19, align: "RIGHT" },
      ]);
      if (order.detail && order.detail !== "") {
        print.tableCustom([
          { text: "", width: 0.08 },
          { text: order.detail, width: 0.9 },
        ]);
      }
      // return print.table([i + 1, order.item, order.price, order.quantity, order.price * order.quantity]);
    });
    print.drawLine();

    var orders = [];
    bill.orderChanges.map((order, _) => {
      if (order.type === "edit") {
        return;
      }
      orders.push(order.orderNo);
    });
    // print.println();
    print.leftRight(
      orders.join(", "),
      "Total: " + req.body.orderHistory.sum + " "
    );
    // logic for tax
    if (!bill.discAmount) bill.discAmount = 0;
    if (bill.discAmount && bill.discAmount > 0)
      print.leftRight("", "Discount: " + bill.discAmount + " ");
    // console.log("hi", parseInt(req.body.orderHistory.sum - parseInt(parseInt(req.body.balance) + parseInt(bill.discAmount))));
    if (
      parseInt(
        req.body.orderHistory.sum -
          parseInt(parseInt(req.body.balance) + parseInt(bill.discAmount))
      ) !== 0
    )
      print.leftRight(
        "",
        "Already Paid: " +
          parseInt(
            req.body.orderHistory.sum -
              parseInt(parseInt(req.body.balance) + parseInt(bill.discAmount))
          ).toString() +
          " "
      );
    if (req.body.orderHistory.sum !== req.body.balance)
      print.leftRight("", "Amount to be paid: " + req.body.balance + " ");
    if (!req.body.preview) {
      print.leftRight("", "Amount Recieved: " + parseInt(req.body.paid) + " ");
      print.leftRight("", "Payment mode: " + req.body.method + " ");
      if (!req.body.preview)
        if (req.body.method === "rfid") {
          print.leftRight("", "Card No.: " + req.body.uid + " ");
        } else if (req.body.method !== "cash") {
          print.leftRight("", "Txn Id: " + req.body.tranId + " ");
        }
      if (req.body.balance - req.body.paid !== 0)
        print.leftRight(
          "",
          "Pending: " +
            parseInt(parseInt(req.body.balance) - parseInt(req.body.paid)) +
            " "
        );
    }
    print.leftRight("Operator: " + req.operator.id, "");
    // print.println("hello");
    print.newLine();
    print.println("Thanks for your visit.");
    // print.drawLine();
    // print.println("Facilities at City Walk Mall");
    // // print.println("")
    // print.setTextSize(1, 1);
    // print.leftRight("Garden Cafe", "Level-0");
    // print.leftRight("Shops & Offices", "Level-0,1");
    // print.leftRight("Perry Club", "Level-2");
    // print.leftRight("Crystal Banquet Hall", "Level-2");
    // print.leftRight("Orient Conference Hall", "Level-2");
    // print.leftRight("Hotel Grand Umega", "Level-3");
    // print.leftRight("Urban Food Court", "Level-4");
    // print.leftRight("Party & Kitty Halls", "Level-4");
    // print.leftRight("City Cinema", "Level-4");
    // print.setTextSize(0, 0);
    // print.println("is now open at Level-4");
    print.cut();
    let execute = await print.execute(); // Executes all the commands. Returns success or throws error
    // console.log(execute);
    return res.send({ execute });
  } catch (err) {
    console.log(err);
    res.status(500).send(err.toString());
  }
});

router.post("/printOrder", async (req, res) => {
  try {
    // return res.status(400).send("Order Slip has been turned off. Contact Tech.")
    const ThermalPrinter = require("node-thermal-printer").printer;
    const PrinterTypes = require("node-thermal-printer").types;
    const electron =
      typeof process !== "undefined" &&
      process.versions &&
      !!process.versions.electro;
    // console.log(req.body.printer);
    let print = new ThermalPrinter({
      type: PrinterTypes.EPSON, // Printer type: 'star' or 'epson'
      interface: "printer:" + req.body.printer, // Printer interface
      // interface: "printer:Microsoft Print to PDF",
      driver: require(electron ? "electron-printer" : "printer"),
    });
    // console.log(1);
    let isConnected = await print.isPrinterConnected(); // Check if print is connected, return bool of status
    // console.log(isConnected);
    print.alignCenter();

    print.setTextSize(1, 1);

    if (!req.body.kot) {
      if (req.body.restaurant === "Perry Club")
        print.println("Urban Food Court");
      else print.println(req.body.restaurant);
    } else {
      print.println("KOT - " + req.body.bill.split("-")[0]);
    }
    print.setTextSize(0, 0);
    if (!req.body.kot) {
      print.println("City Walk Mall, Hanumangarh Road, Abohar");

      print.println("A Unit of RDESCO City Walk Pvt. Ltd.");
      print.leftRight("GSTIN: 03AAICR8822Q1ZS", "FSSAI: 12119201000010");
    }
    print.newLine();

    print.leftRight(
      "Bill No. : " + req.body.bill,
      "Date: " + new Date(Date.now()).toLocaleDateString("en-GB")
    );
    print.leftRight(
      "Table: " + req.body.table,
      "Time: " + new Date(Date.now()).toLocaleTimeString()
    );
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
    print.println(req.body.orderId + "-" + req.body.counterName);
    print.setTextSize(0, 0);
    print.cut();
    let execute = await print.execute(); // Executes all the commands. Returns success or throws error
    // console.log(execute);
    return res.send({ execute });
  } catch (err) {
    console.log(err);
    res.status(500).send(err.toString());
  }
});

router.post("/addDiscount", auth_operator, async (req, res) => {
  try {
    var bill = await Bill.findOne({ billId: req.body.bill });
    if (!bill) {
      return res.status(400), send("Bill not found");
    }
    bill = bill.toJSON();
    if (bill.discType && bill.discType !== "none") {
      bill.balance = bill.balance + bill.discAmount;
    }
    bill.discType = req.body.discType;
    bill.discBy = req.operator.id;
    bill.balance = bill.balance - req.body.discAmount;
    bill.discReason = req.body.discReason;
    bill.discAmount = req.body.discAmount;
    if (req.body.table) {
      // console.log(req.body.table);
      var table = (await Table.findOne({ tableId: req.body.table })).toJSON();
      if (table.discType && table.discType !== "none") {
        table.balance = table.balance + table.discAmount;
      }
      table.discType = req.body.discType;
      table.discBy = req.operator.id;
      table.balance = table.balance - req.body.discAmount;
      table.discReason = req.body.discReason;
      table.discAmount = req.body.discAmount;
      (
        await Table.findOneAndUpdate({ tableId: req.body.table }, table, {
          useFindAndModify: false,
        })
      ).save();
    }
    (
      await Bill.findOneAndUpdate({ billId: req.body.bill }, bill, {
        useFindAndModify: false,
      })
    ).save();
    res.send("Discount Applied");
  } catch (err) {
    console.log(err, err.response);
    res.status(500).send(err.toString());
  }
});

router.get("/printers", auth_admin, async (req, res) => {
  var printers = printer.getPrinters();
  // console.log(printers);
  res.send({ printers });
});

router.get("/clearBills", async (req, res) => {
  // var bills = await db.collection("table").where("restaurant", "==", "Perry Club").get();
  // bills = bills.docs;
  // for (var i = 0; i < bills.length; i++) {
  //   db.collection("table").doc(bills[i].id).delete();
  // }
  res.send("done");
});

router.post("/editBill", auth_operator, async (req, res) => {
  try {
    var bill = (await Bill.findOne({ billId: req.body.bill })).toJSON();
    // console.log(req.body.orderHistory);
    bill.finalOrder = req.body.orderHistory;
    bill.balance = bill.balance - req.body.orderChange.sum;
    var table = (await Table.findOne({ tableId: req.body.table })).toJSON();
    table.balance = table.balance - req.body.orderChange.sum;
    table.orderHistory = req.body.orderHistory;
    req.body.orderChange.sum = req.body.orderChange.sum * -1;
    bill.orderChanges.push({
      ...req.body.orderChange,
      type: "edit",
      by: req.operator.id,
      at: Date.now(),
    });
    (
      await Table.findOneAndUpdate({ tableId: req.body.table }, table, {
        useFindAndModify: false,
      })
    ).save();
    (
      await Bill.findOneAndUpdate({ billId: req.body.bill }, bill, {
        useFindAndModify: false,
      })
    ).save();
    res.send("done");
  } catch (err) {
    console.log(err);
    res.status(500).send(err.toString());
  }
});
const isEqual = function (obj1, obj2) {
  const obj1Keys = Object.keys(obj1);
  const obj2Keys = Object.keys(obj2);

  if (obj1Keys.length !== obj2Keys.length) {
    return false;
  }

  for (let objKey of obj1Keys) {
    if (obj1[objKey] !== obj2[objKey]) {
      if (typeof obj1[objKey] == "object" && typeof obj2[objKey] == "object") {
        if (!isEqual(obj1[objKey], obj2[objKey])) {
          return false;
        }
      } else {
        return false;
      }
    }
  }

  return true;
};
router.post("/editTransaction", auth_operator, async (req, res) => {
  try {
    var bill = await Bill.findOne({ billId: req.body.bill });
    if (!bill) {
      res.status(400).send("Bill not found");
    }
    bill = bill.toJSON();
    // console.log(bill.transactions[req.body.index], req.body.transaction);
    if (!isEqual(bill.transactions[req.body.index], req.body.transaction)) {
      return res.status(400).send("Transaction Doesn't Match");
    }
    bill.transactions.splice(req.body.index, 1);
    bill.balance = bill.balance + req.body.transaction.amount;
    await new OperatorTransaction({
      operatorId: req.operator.id,
      at: Date.now(),
      tranId: req.body.reason,
      amount: req.body.transaction.amount,
      bill: req.body.bill,
      type: req.body.transaction.type + " Transaction cancel",
    }).save();
    if (req.body.transaction.type === "cash") {
      var operator = await Operator.findOne({ operatorId: req.operator.id });
      if (!operator) {
        return res.status(400).send("Operator not found");
      }
      operator = operator.toJSON();
      operator.balance = operator.balance - req.body.transaction.amount;
      (
        await Operator.findOneAndReplace(
          { operatorId: req.operator.id },
          operator
        )
      ).save();
    }

    (await Bill.findOneAndReplace({ billId: req.body.bill }, bill)).save();
    return res.send("Done");
  } catch (err) {
    console.log(err);
    res.status(500).send(err.toString());
  }
});

router.post("/addToBooking", auth_operator, async (req, res) => {
  try {
    var now = Date.now();
    var bill = await Bill.findOne({ billId: req.body.bill });
    if (!bill) {
      return res.status(400).send("Bill not found");
    }
    bill = bill.toJSON();
    try {
      if (bill.transactions[0].type === "moved to booking") {
        return res.status(400).send("Already moved to a booking");
      }
    } catch {}
    var booking = await Booking.findOne({ bookingId: req.body.bookingId });
    if (!booking) {
      return res.status(400).send("Booking not found");
    }
    booking = booking.toJSON();
    bill.transactions.unshift({
      type: "moved to booking",
      amount: bill.balance,
      tranId: req.body.bookingId,
      at: now,
      by: req.operator.id,
    });
    if (!booking.bills) {
      booking.bills = [];
    }
    booking.bills.push({
      bill: req.body.bill,
      at: now,
      amount: bill.balance,
      by: req.operator.id,
    });
    var table = await Table.findOne({ bill: req.body.bill });
    if (!!table) {
      table = table.toJSON();
      table.bill = "";
      table.orderHistory = { sum: 0, order: [] };
      table.orderSnippet = [];
      table.balance = 0;
      (await Table.findOneAndReplace({ bill: req.body.bill }, table)).save();
    }
    bill.balance = 0;
    (
      await Booking.findOneAndReplace(
        { bookingId: req.body.bookingId },
        booking
      )
    ).save();
    (await Bill.findOneAndReplace({ billId: req.body.bill }, bill)).save();
    res.send("Done");
  } catch (err) {
    console.log(err);
    res.status(500).send(err.toString());
  }
});

router.post("/cancelBill", auth_operator, async (req, res) => {
  try {
    var bill = await Bill.findOne({ billId: req.body.bill });
    bill = bill.toJSON();
    if (bill.transactions && bill.transactions.length > 0) {
      return res.status(400).send("Remove transactions from this bill first.");
    }
    var table = await Table.findOne({ bill: req.body.bill });
    if (!!table) {
      table = table.toJSON();
      table.bill = "";
      table.orderHistory = { sum: 0, order: [] };
      table.orderSnippet = [];
      table.balance = 0;
      (await Table.findOneAndReplace({ bill: req.body.bill }, table)).save();
    }
    bill = await Bill.findOneAndUpdate(
      { billId: req.body.bill },
      { cancelled: true, reason: req.body.reason }
    );
    bill.save();
    await new OperatorTransaction({
      operatorId: req.operator.id,
      at: Date.now(),
      tranId: req.body.reason,
      amount: "Cancelled",
      bill: req.body.bill,
      type: "Bill cancel",
    }).save();
    return res.send("done");
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
});

module.exports = router;
