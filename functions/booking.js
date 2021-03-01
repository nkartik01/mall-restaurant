const express = require("express");
const router = express.Router();
const Booking = require("./models/Booking");
const fs = require("fs");
const moment = require("moment");
const Room = require("./models/Room");
router.post("/editBooking", async (req, res) => {
  try {
    console.log(req.body.bookingId);
    for (var i = 0; i < req.body.rooms.length; i++) {
      var room = req.body.rooms[i];
      var b = await Booking.findOne({
        rooms: {
          $elemMatch: {
            $or: [{ arrivalTime: { $gte: room.arrivalTime, $lte: room.checkoutTime } }, { checkoutTime: { $lte: room.checkoutTime, $gte: room.arrivalTime } }],
            room: room.room.label,
          },
        },
        bookingId: { $ne: req.body.bookingId },
      });
      if (b) {
        b = b.toObject();
        return res.status(400).send("Room: " + room.room.label + " clashes with booking Id: " + b.bookingId);
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
        var bitmap = await new Buffer.from(req.body.rooms[i].photo.slice(23), "base64");
        fs.writeFileSync("../../images/photo/" + bookingId + "_" + (i + 1).toString() + ".jpg", bitmap);
        delete req.body.rooms[i].photo;
      }
      if (req.body.rooms[i].id) {
        var bitmap = await new Buffer.from(req.body.rooms[i].id.slice(23), "base64");
        fs.writeFileSync("../../images/id/" + bookingId + "_" + (i + 1).toString() + ".jpg", bitmap);
        delete req.body.rooms[i].id;
      }
      req.body.rooms[i].room = req.body.rooms[i].room.label;
    }
    if (req.body.bookingId && req.body.bookingId !== "") {
      (await Booking.findOneAndUpdate({ bookingId: req.body.bookingId }, { ...req.body }, { useFindAndModify: false })).save();
    } else {
      req.body.bookingId = booking.length + 1;
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
    var bookings = await Booking.find({ rooms: { $elemMatch: { arrivalTime: { $lt: date2 }, checkoutTime: { $gt: date1 } } } });
    var rooms = {};
    bookings.map((booking, i) => {
      booking = booking.toObject();
      booking.id = booking.bookingId;
      booking.rooms.map((room, k) => {
        try {
          var photo = fs.readFileSync("../../images/photo/" + booking.id + "_" + (k + 1).toString() + ".jpg", { encoding: "base64" });
          room.photo = "data:image/jpeg;base64," + photo.toString();
        } catch {}
        try {
          var id = fs.readFileSync("../../images/id/" + booking.id + "_" + (k + 1).toString() + ".jpg", { encoding: "base64" });
          room.id = "data:image/jpeg;base64," + id.toString();
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
    res.status(500).send(err);
  }
});

router.post("/room", async (req, res) => {
  try {
    var date1 = new Date(new Date(req.body.date).setHours(0, 0, 0, 0)).setDate(1);
    console.log(new Date(date1).toLocaleString());
    var days = moment(date1).daysInMonth();
    console.log(days);
    var dates = {};
    var date2 = date1 + days * (1000 * 60 * 60 * 24);
    for (var i = 0; i < days; i = i + 1) {
      var bookings = await Booking.find({ rooms: { $elemMatch: { room: req.body.room, arrivalTime: { $lt: date1 + 1000 * 60 * 60 * 24 }, checkoutTime: { $gt: date1 } } } });

      bookings = bookings.map((booking, j) => {
        booking = booking.toObject();
        booking.id = booking.bookingId;

        // console.log(booking);
        booking.rooms = booking.rooms.map((room, k) => {
          try {
            var photo = fs.readFileSync("../../images/photo/" + booking.id + "_" + (k + 1).toString() + ".jpg", { encoding: "base64" });
            room.photo = "data:image/jpeg;base64," + photo.toString();
          } catch {}
          try {
            var id = fs.readFileSync("../../images/id/" + booking.id + "_" + (k + 1).toString() + ".jpg", { encoding: "base64" });
            room.id = "data:image/jpeg;base64," + id.toString();
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
    res.status(500).send(err);
  }
});

router.get("/rooms", async (req, res) => {
  try {
    var rooms = await Room.find({});
    for (var i = 0; i < rooms.length; i++) {
      rooms[i] = rooms[i].toObject().roomId;
    }
    res.send({ rooms });
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
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
    res.status(500).send(err);
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
    res.status(500).send(err);
  }
});

module.exports = router;
