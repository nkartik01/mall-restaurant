const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const auth_admin = require("./middleware/auth_admin");
const auth_operator = require("./middleware/auth_operator");
var backup = require("./backup.js");
const config = require("./config/default.json");
const fs = require("fs");
const { exec } = require("child_process");
const Config = require("./models/Config");
router.post("/sale", async (req, res) => {
  try {
    var start = new Date(parseInt(req.body.start));
    start.setHours(0, 0, 0, 0);
    start = start.valueOf();
    var end = new Date(parseInt(req.body.end));
    end.setHours(23, 59, 59, 999);
    end = end.valueOf();

    var bills;
    var cancelled;
    if (req.body.restaurant !== "overall") {
      bills = await Bill.find({
        at: { $gt: start, $lte: end },
        cancelled: { $ne: true },
        restaurant: req.body.restaurant,
      });
      cancelled = await Bill.find({
        at: { $gt: start, $lte: end },
        cancelled: true,
        restaurant: req.body.restaurant,
      });
    } else {
      bills = await Bill.find({
        at: { $gt: start, $lte: end },
        cancelled: { $ne: true },
      });
      cancelled = await Bill.find({
        at: { $gt: start, $lte: end },
        cancelled: true,
      });
    }
    for (var i = 0; i < cancelled.length; i++) {
      var bill = cancelled[i].toJSON();
      bill.id = cancelled[i].billId;
      cancelled[i] = bill;
    }

    for (var i = 0; i < bills.length; i++) {
      var bill = bills[i].toJSON();
      bill.id = bills[i].billId;
      bills[i] = bill;
    }
    var sum = 0;
    var balance = 0;
    var discAmount = 0;
    bills.map((bill, _) => {
      sum = sum + bill.finalOrder.sum;
      balance = balance + bill.balance;
      if (bill.discAmount) discAmount = discAmount + bill.discAmount;
      return;
    });
    var upiSum = 0;
    var cashSum = 0;
    var rfidSum = 0;
    var cardSum = 0;
    var movedSum = 0;
    var itemwise = [];
    var itemwiseEdit = [];
    var menuwise = [];
    var tax = {};
    bills.map((bill, _) => {
      try {
        bill.finalOrder.order.map((orderItem, _) => {
          var c = 0;
          itemwise.map((item, _) => {
            if (
              item.item === orderItem.item &&
              item.price === orderItem.price
            ) {
              item.quantity = item.quantity + orderItem.quantity;
              c = 1;
            }
          });
          if (c === 0) {
            itemwise.push({ ...orderItem });
          }
          c = 0;
          menuwise.map((item, _) => {
            if (item.menuId === orderItem.menuId) {
              item.amount = (
                parseFloat(item.amount) +
                parseFloat(orderItem.price) * parseInt(orderItem.quantity)
              ).toFixed(2);
              c = 1;
            }
          });
          if (c === 0) {
            menuwise.push({
              menuId: orderItem.menuId,
              amount:
                parseFloat(orderItem.price) * parseInt(orderItem.quantity),
            });
          }
          if (orderItem.tax && orderItem.tax !== "") {
            var orderTax = orderItem.tax.split(";");
            orderTax.map((taxItem) => {
              var item = taxItem.split(":");
              if (!tax[item[0].toUpperCase()]) {
                tax[item[0].toUpperCase()] = 0;
              }
              tax[item[0].toUpperCase()] = (
                parseFloat(tax[item[0].toUpperCase()]) +
                (parseFloat(item[1]) * orderItem.price * orderItem.quantity) /
                  100
              ).toFixed(2);
            });
          }
        });
      } catch {}
      itemwise.sort((a, b) => {
        if (a.item < b.item) {
          return -1;
        }
        if (a.item > b.item) {
          return 1;
        }
        return 0;
      });
      try {
        bill.orderChanges
          .filter((order, _) => {
            if (order.type === "edit") {
              return true;
            }
            return false;
          })
          .map((order, _) => {
            itemwiseEdit.push({ ...order });

            return;
          });
      } catch {}
      try {
        bill.transactions.map((tran, _) => {
          if (tran.type === "cash") cashSum = cashSum + tran.amount;
          if (tran.type === "card") cardSum = cardSum + tran.amount;
          if (tran.type === "rfid") rfidSum = rfidSum + tran.amount;
          if (tran.type === "upi") upiSum = upiSum + tran.amount;
          if (tran.type === "moved to booking")
            movedSum = movedSum + tran.amount;
          return;
        });
      } catch {}
      return;
    });
    res.send({
      bills: bills,
      itemwise,
      itemwiseEdit,
      upiSum,
      cashSum,
      cardSum,
      rfidSum,
      sum,
      balance,
      discAmount,
      cancelled,
      movedSum,
      menuwise,
      tax,
    });
  } catch (err) {
    console.log(err);
    res.status(500).send(err.toString());
  }
});

router.get("/backup", auth_admin, async (req, res) => {
  // console.log(backup({uri:}));
  var testClass1 = await backup({
    user: "root", // MongoDB username
    pass: "", // MongoDB password
    host: "localhost", // MongoDB host
    port: "27017", // MongoDB port
    database: "mall", // MongoDB database name
    backupfolder: "C:/", // Backup Folder Name
    backuplimit: 3,
  });
  // res.writeHead(200, {
  //   "Content-Type": "application/zip",
  //   "Content-disposition": "attachment; filename=backup.zip",
  // });
  // fs.readFileSync(testClass1);
  // var str = testClass1 + ".zip";
  // console.log(str);
  // res.pipe(fs.createReadStream(str));
  // backup({ uri: "mongodb://localhost:27017/mall", root: __dirname });
  return res.send("Backup saved at " + testClass1);
});

router.post("/restore", auth_admin, async (req, res) => {
  try {
    var address = req.body.address;
    await exec('mongo mall --eval "db.dropDatabase()"', function (err, stdout) {
      if (err) throw err;
      if (stdout) {
        console.log(stdout);
      }
      restore(address);
      return res.send("done");
    });
  } catch (err) {
    console.log(err);
    res.status(500).send(err.toString());
  }
});

function restore(address) {
  fs.readdirSync(address).map((file) => {
    exec(
      "mongoimport mongodb://localhost:27017/mall -d mall " +
        address +
        "/" +
        file,
      function (err, stdout, stderr) {
        if (err) throw err;
        if (stdout) console.log(stdout);
      }
    );
  });
}

router.post("/clearDatabase", auth_admin, async (req, res) => {
  try {
    var start = new Date(parseInt(req.body.start));
    start.setHours(0, 0, 0, 0);
    start = start.valueOf();
    var end = new Date(parseInt(req.body.end));
    end.setHours(23, 59, 59, 999);
    end = end.valueOf();
    console.log(start, end);
    await Bill.find({ at: { $lte: end, $gte: start } }).deleteMany();
    await OperatorTransaction.find({
      at: { $lte: end, $gte: start },
    }).deleteMany();
    await ChefSide.find({ at: { $lte: end, $gte: start } }).deleteMany();
  } catch (err) {
    console.log(err);
    res.status(500).send(err.toString());
  }
});

router.post("/mail", auth_operator, async (req, res) => {
  try {
    var config = await Config.findOne({});
    config = config.toJSON();
    console.log(config.sendMailForEdit, config.sendMailForEdit !== true);

    if (
      (req.body.type === "edit" && config.sendMailForEdit !== true) ||
      (req.body.type === "cancel" && config.sendMailForCancel !== true)
    ) {
      return res.send("MailNotNeeded");
    }
    console.log("hello");
    var nodemailer = require("nodemailer");
    var transport = nodemailer.createTransport({
      service: "gmail",
      host: "smtp.gmail.com",
      auth: {
        user: config.fromEmail,
        pass: config.password,
      },
    });
    var mailOptions = {
      from: `Mall <${config.fromEmail}>`,
      // to: emails,
      to: config.toEmail,
      subject: req.body.header,
      html: `${req.body.content}`,
    };
    var err = 0;
    await new Promise((resolve, reject) => {
      transport.sendMail(mailOptions, async (error, info) => {
        if (error) reject(error);
        console.log(info);
        resolve(info);
      });
    });
    res.send("Mail Sent");
  } catch (err) {
    console.log(err);
    res.status(500).send(err.toString);
  }
});

module.exports = router;
