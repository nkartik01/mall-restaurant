const express = require("express");
const router = express.Router();
const Booking = require("./models/Booking");
const fs = require("fs");
const moment = require("moment");
const Room = require("./models/Room");
const auth_operator = require("./middleware/auth_operator");
router.post("/editBooking", async (req, res) => {
  try {
    console.log(req.body.bookingId);
    for (var i = 0; i < req.body.rooms.length; i++) {
      for (var j = 0; j < req.body.rooms.length; j++) {
        if (i === j) {
          continue;
        }
        console.log(req.body.rooms[i].room.label, req.body.rooms[j].room.label);
        console.log(
          req.body.rooms[i].arrivalTime,
          req.body.rooms[j].arrivalTime
        );
        if (req.body.rooms[i].room.label === req.body.rooms[j].room.label) {
          if (
            (req.body.rooms[i].arrivalTime > req.body.rooms[j].arrivalTime &&
              req.body.rooms[i].arrivalTime > req.body.rooms[j].checkoutTime) ||
            (req.body.rooms[i].checkoutTime < req.body.rooms[j].checkoutTime &&
              req.body.rooms[i].checkoutTime > req.body.rooms[j].arrivalTime) ||
            req.body.rooms[i].arrivalTime === req.body.rooms[j].arrivalTime
          ) {
            return res
              .status(400)
              .send(
                "Room " +
                  req.body.rooms[i].room.label +
                  " clashes within the booking"
              );
          }
        }
      }
    }
    for (var i = 0; i < req.body.rooms.length; i++) {
      var room = req.body.rooms[i];
      var b = await Booking.findOne({
        rooms: {
          $elemMatch: {
            $or: [
              {
                arrivalTime: {
                  $gte: room.arrivalTime,
                  $lte: room.checkoutTime,
                },
              },
              {
                checkoutTime: {
                  $lte: room.checkoutTime,
                  $gte: room.arrivalTime,
                },
              },
            ],
            room: room.room.label,
          },
        },
        bookingId: { $ne: req.body.bookingId },
      });
      if (b) {
        b = b.toJSON();
        return res
          .status(400)
          .send(
            "Room: " +
              room.room.label +
              " clashes with booking Id: " +
              b.bookingId
          );
      }
    }
    var booking = await Booking.find({});
    var bookingId;
    if (req.body.bookingId && req.body.bookingId !== "") {
      bookingId = req.body.bookingId;
    } else {
      bookingId = booking.length + 1;
    }
    for (var i = 0; i < req.body.rooms.length; i++) {
      if (req.body.rooms[i].photo) {
        var bitmap = await new Buffer.from(
          req.body.rooms[i].photo.slice(23),
          "base64"
        );
        fs.writeFileSync(
          "C:/images/photo/" + bookingId + "_" + (i + 1).toString() + ".jpg",
          bitmap
        );
        delete req.body.rooms[i].photo;
      }
      if (req.body.rooms[i].idFront) {
        var bitmap = await new Buffer.from(
          req.body.rooms[i].idFront.slice(23),
          "base64"
        );
        fs.writeFileSync(
          "C:/images/id/" + bookingId + "_F" + (i + 1).toString() + ".jpg",
          bitmap
        );
        delete req.body.rooms[i].idFront;
      }
      if (req.body.rooms[i].idBack) {
        var bitmap = await new Buffer.from(
          req.body.rooms[i].idBack.slice(23),
          "base64"
        );
        fs.writeFileSync(
          "C:/images/id/" + bookingId + "_B" + (i + 1).toString() + ".jpg",
          bitmap
        );
        delete req.body.rooms[i].idBack;
      }
      req.body.rooms[i].room = req.body.rooms[i].room.label;
    }
    if (req.body.bookingId && req.body.bookingId !== "") {
      (
        await Booking.findOneAndUpdate(
          { bookingId: req.body.bookingId },
          { ...req.body },
          { useFindAndModify: false }
        )
      ).save();
    } else {
      var at = Date.now();
      req.body.bookingId = booking.length + 1;
      // new Bill({
      //   billId: "H-" + booking.bookingId,
      //   billNo: booking.bookingId,
      //   restraunt: "Hotel Hive",
      //   orderChanges: [],
      //   balance: 0,
      //   at,
      //   transactions: [],
      //   finalOrder: { order: [], sum: 0 },
      // }).save();
      booking = new Booking(req.body).save();
    }
    return res.send({ bookingId: req.body.bookingId });
  } catch (err) {
    console.log(err);
    res.status(500).end(err);
  }
});

router.post("/date", async (req, res) => {
  try {
    var date1 = new Date(req.body.date).setHours(0, 0, 0, 0);
    var date2 = date1 + 1000 * 60 * 60 * 24;
    var bookings = await Booking.find({
      cancelled: { $ne: true },
      rooms: {
        $elemMatch: {
          arrivalTime: { $lt: date2 },
          checkoutTime: { $gt: date1 },
        },
      },
    });
    var rooms = {};
    bookings.map((booking, i) => {
      booking = booking.toJSON();
      booking.id = booking.bookingId;
      booking.rooms.map((room, k) => {
        try {
          var photo = fs.readFileSync(
            "C:/images/photo/" + booking.id + "_" + (k + 1).toString() + ".jpg",
            { encoding: "base64" }
          );
          room.photo = "data:image/jpeg;base64," + photo.toString();
        } catch {}
        try {
          var idFront = fs.readFileSync(
            "C:/images/id/" + booking.id + "_F" + (k + 1).toString() + ".jpg",
            { encoding: "base64" }
          );
          room.idFront = "data:image/jpeg;base64," + idFront.toString();
        } catch {}
        try {
          var idBack = fs.readFileSync(
            "C:/images/id/" + booking.id + "_B" + (k + 1).toString() + ".jpg",
            { encoding: "base64" }
          );
          room.idBack = "data:image/jpeg;base64," + idBack.toString();
        } catch {}
        room.arrivalTime = new Date(room.arrivalTime);
        room.arrivalTime =
          room.arrivalTime.getFullYear().toString() +
          "-" +
          (room.arrivalTime.getMonth() + 1).toString().padStart(2, 0) +
          "-" +
          room.arrivalTime.getDate().toString().padStart(2, 0) +
          "T" +
          room.arrivalTime.getHours().toString().padStart(2, 0) +
          ":" +
          room.arrivalTime.getMinutes().toString().padStart(2, 0);
        room.checkoutTime = new Date(room.checkoutTime);
        room.checkoutTime =
          room.checkoutTime.getFullYear().toString() +
          "-" +
          (room.checkoutTime.getMonth() + 1).toString().padStart(2, 0) +
          "-" +
          room.checkoutTime.getDate().toString().padStart(2, 0) +
          "T" +
          room.checkoutTime.getHours().toString().padStart(2, 0) +
          ":" +
          room.checkoutTime.getMinutes().toString().padStart(2, 0);
        room.room = { label: room.room, value: room.room };
        if (!rooms[room.room.label]) {
          rooms[room.room.label] = [];
        }
        rooms[room.room.label].push(booking);
      });
    });
    return res.send({ rooms });
  } catch (err) {
    console.log(err);
    res.status(500).send(err.toString());
  }
});

router.post("/room", async (req, res) => {
  try {
    var date1 = new Date(new Date(req.body.date).setHours(0, 0, 0, 0)).setDate(
      1
    );
    console.log(new Date(date1).toLocaleString());
    var days = moment(date1).daysInMonth();
    console.log(days);
    var dates = {};
    var date2 = date1 + days * (1000 * 60 * 60 * 24);
    for (var i = 0; i < days; i = i + 1) {
      var bookings = await Booking.find({
        cancelled: { $ne: true },
        rooms: {
          $elemMatch: {
            room: req.body.room,
            arrivalTime: { $lt: date1 + 1000 * 60 * 60 * 24 },
            checkoutTime: { $gt: date1 },
          },
        },
      });

      bookings = bookings.map((booking, j) => {
        booking = booking.toJSON();
        booking.id = booking.bookingId;

        // console.log(booking);
        booking.rooms = booking.rooms.map((room, k) => {
          try {
            var photo = fs.readFileSync(
              "C:/images/photo/" +
                booking.id +
                "_" +
                (k + 1).toString() +
                ".jpg",
              { encoding: "base64" }
            );
            room.photo = "data:image/jpeg;base64," + photo.toString();
          } catch {}
          try {
            var idFront = fs.readFileSync(
              "C:/images/id/" + booking.id + "_F" + (k + 1).toString() + ".jpg",
              { encoding: "base64" }
            );
            room.idFront = "data:image/jpeg;base64," + idFront.toString();
          } catch {}
          try {
            var idBack = fs.readFileSync(
              "C:/images/id/" + booking.id + "_B" + (k + 1).toString() + ".jpg",
              { encoding: "base64" }
            );
            room.idBack = "data:image/jpeg;base64," + idBack.toString();
          } catch {}

          room.arrivalTime = new Date(room.arrivalTime);
          room.arrivalTime =
            room.arrivalTime.getFullYear().toString() +
            "-" +
            (room.arrivalTime.getMonth() + 1).toString().padStart(2, 0) +
            "-" +
            room.arrivalTime.getDate().toString().padStart(2, 0) +
            "T" +
            room.arrivalTime.getHours().toString().padStart(2, 0) +
            ":" +
            room.arrivalTime.getMinutes().toString().padStart(2, 0);
          room.checkoutTime = new Date(room.checkoutTime);
          room.checkoutTime =
            room.checkoutTime.getFullYear().toString() +
            "-" +
            (room.checkoutTime.getMonth() + 1).toString().padStart(2, 0) +
            "-" +
            room.checkoutTime.getDate().toString().padStart(2, 0) +
            "T" +
            room.checkoutTime.getHours().toString().padStart(2, 0) +
            ":" +
            room.checkoutTime.getMinutes().toString().padStart(2, 0);
          room.room = { label: room.room, value: room.room };
          return room;
        });
        return booking;
      });
      date1 = date1 + 60 * 1000 * 60 * 24;
      dates[i + 1] = bookings;
    }
    return res.send({ dates });
  } catch (err) {
    console.log(err);
    res.status(500).send(err.toString());
  }
});

router.get("/photo/:name", async (req, res) => {
  try {
    var name = req.params.name;
    return res.send(fs.readFileSync("C:/images/photo/" + name));
  } catch (err) {
    console.log(err);
    res.status(500).send(err.toString());
  }
});

router.get("/rooms", async (req, res) => {
  try {
    var rooms = await Room.find({});
    for (var i = 0; i < rooms.length; i++) {
      rooms[i] = rooms[i].toJSON().roomId;
    }
    res.send({ rooms });
  } catch (err) {
    console.log(err);
    res.status(500).send(err.toString());
  }
});

router.post("/addRoom", async (req, res) => {
  try {
    var room = await Room.findOne({ roomId: req.body.room });
    if (room) {
      return res.status(400).send("Room already exists");
    }
    new Room({ roomId: req.body.room }).save();
    res.send("Room Created");
  } catch (err) {
    console.log(err);
    res.status(500).send(err.toString());
  }
});

router.delete("/deleteRoom", async (req, res) => {
  try {
    var room = await Room.findOne({ roomId: req.body.room });
    if (!room) {
      return res.status(400).send("Room doesn't exist");
    }
    (await Room.findOneAndDelete({ roomId: req.body.room })).save();
    res.send("Room Created");
  } catch (err) {
    console.log(err);
    res.status(500).send(err.toString());
  }
});

router.post("/cancelBooking", async (req, res) => {
  try {
    // var bill=
    (
      await Booking.findOneAndUpdate(
        { bookingId: req.body.bookingId },
        { cancelled: true }
      )
    ).save();
    return res.send("Done");
  } catch (err) {
    console.log(err);
    res.status(500).send(err.toString());
  }
});

router.post("/checkout", async (req, res) => {
  try {
    var booking = await Booking.findOne({ bookingId: req.body.bookingId });
    booking = booking.toJSON();
    var sum = 0;
    var bill = await Bill.find({ billId: "H-" + req.body.bookingId });
    if (bill.length > 0) {
      bill = bill[0].toJSON();
      (
        await Bill.findOneAndUpdate(
          { billId: "H-" + req.body.bookingId },
          {
            to:
              booking.rooms[0].name +
              (booking.rooms[0].company
                ? " C/o " + booking.rooms[0].company
                : ""),
            gstin: booking.rooms[0].gstin,
            finalOrder: {
              order: [
                ...booking.rooms.map((room) => {
                  sum =
                    sum +
                    room.roomRate *
                      parseInt(
                        (new Date(room.checkoutTime).valueOf() -
                          new Date(room.arrivalTime).valueOf()) /
                          (1000 * 60 * 60 * 24) +
                          1,
                        10
                      );
                  return {
                    item:
                      (room.room ? room.room : "") +
                      " (" +
                      new Date(room.arrivalTime).toLocaleString("en-GB") +
                      " to " +
                      new Date(room.checkoutTime).toLocaleString("en-GB") +
                      ")",
                    price: room.roomRate,
                    quantity: parseInt(
                      (new Date(room.checkoutTime).valueOf() -
                        new Date(room.arrivalTime).valueOf()) /
                        (1000 * 60 * 60 * 24) +
                        1,
                      10
                    ),
                  };
                }),
                ...booking.bills.map((bill) => {
                  sum = sum + bill.amount;
                  return {
                    item:
                      bill.bill +
                      " (" +
                      new Date(bill.at).toLocaleString("en-GB") +
                      ")",
                    price: bill.amount,
                    quantity: 1,
                  };
                }),
              ],
              sum,
            },
            balance:
              parseInt(bill.balance) +
              (parseInt(sum) - parseInt(bill.finalOrder.sum)),
          },
          { useFindAndModify: false }
        )
      ).save();
    } else {
      var sum = 0;
      new Bill({
        billId: "H-" + booking.bookingId,
        billNo: booking.bookingId,
        restaurant: "Hotel Hive",
        to:
          booking.rooms[0].name +
          (booking.rooms[0].company ? " C/o " + booking.rooms[0].company : ""),
        gstin: booking.rooms[0].gstin,

        at: new Date(Date.now()).valueOf(),
        finalOrder: {
          order: [
            ...booking.rooms.map((room) => {
              sum =
                sum +
                room.roomRate *
                  parseInt(
                    (new Date(room.checkoutTime).valueOf() -
                      new Date(room.arrivalTime).valueOf()) /
                      (1000 * 60 * 60 * 24) +
                      1,
                    10
                  );
              return {
                item:
                  (room.room ? room.room : "") +
                  " (" +
                  new Date(room.arrivalTime).toLocaleString("en-GB") +
                  " to " +
                  new Date(room.checkoutTime).toLocaleString("en-GB") +
                  ")",
                price: room.roomRate,
                quantity: parseInt(
                  (new Date(room.checkoutTime).valueOf() -
                    new Date(room.arrivalTime).valueOf()) /
                    (1000 * 60 * 60 * 24) +
                    1,
                  10
                ),
              };
            }),
            ...booking.bills.map((bill) => {
              sum = sum + bill.amount;
              return {
                item:
                  bill.bill +
                  " (" +
                  new Date(bill.at).toLocaleString("en-GB") +
                  ")",
                price: bill.amount,
                quantity: 1,
              };
            }),
          ],
          sum,
        },
        orderChanges: [],
        gstIncluded: booking.gstIncuded,
        balance: sum,
        transactions: [],
      }).save();
    }
    res.send("billGenerated");
  } catch (err) {
    console.log(err);
    res.status(500).send(err.toString());
  }
});

module.exports = router;
