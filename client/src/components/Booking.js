import React, { Fragment } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { Col, Row } from "react-bootstrap";
import RoomModal from "./RoomModal";
import axios from "axios";
import BookingModal from "./BookingModal";
export default class Booking extends React.Component {
  state = {
    date: new Date(),
    today: new Date(),
    tomorrow: new Date(new Date().getTime() + 24 * 60 * 60 * 1000),
    rooms: [
      { room: 301, booked: false, bookings: [] },
      { room: 302, booked: false, bookings: [] },
      { room: 303, booked: false, bookings: [] },
      { room: 304, booked: false, bookings: [] },
    ],
  };
  getBookings = async () => {
    var res = await axios.post(require("../config.json").url + "booking/date", { date: this.state.date });
    res = res.data.rooms;
    console.log(res);
    for (var i = 0; i < this.state.rooms.length; i++) {
      if (res[this.state.rooms[i].room]) {
        this.state.rooms[i].bookings = res[this.state.rooms[i].room];
      } else {
        this.state.rooms[i].bookings = [];
      }
    }
    this.setState({});
  };
  componentDidMount() {
    this.getBookings();
  }
  changeDate = async (e) => {
    this.setState({ date: e });
    const delay = (millis) =>
      new Promise((resolve, reject) => {
        setTimeout((_) => resolve(), millis);
      });
    await delay(100);
    this.getBookings();
  };
  render() {
    var roomsList = [];
    this.state.rooms.map((room) => {
      roomsList.push({ value: room.room, label: room.room });
      return null;
    });
    return (
      <Fragment>
        <Row>
          <Col sm={3}>
            <Calendar value={this.state.date} onChange={this.changeDate} />
            <button
              onClick={(e) => {
                e.preventDefault();
                this.setState({ show: true });
              }}
            >
              New Booking
            </button>
            <BookingModal setShow={() => this.setState({ show: false })} booking={{ rooms: [] }} show={this.state.show} />
          </Col>
          <Col sm={8}>
            <Fragment>
              <div className="row">
                {this.state.rooms.map((room, roomInd) => {
                  var today = new Date(this.state.date).setHours(0, 0, 0, 0);
                  var tomorrow = today + 24 * 60 * 60 * 1000;
                  var a = [];
                  for (var i = today; i <= tomorrow; i = i + 600000) {
                    var c = 0;
                    for (var j = 0; j < room.bookings.length; j++) {
                      for (var k = 0; k < room.bookings[j].rooms.length; k++) {
                        if (!(room.bookings[j].rooms[k].room.label === room.room)) {
                          continue;
                        }
                        var arrival = new Date(room.bookings[j].rooms[k].arrivalTime);
                        var checkout = new Date(room.bookings[j].rooms[k].checkoutTime);
                        if (i > arrival && i < checkout) {
                          c = 1;
                          a.push(
                            <td
                              style={{ border: "2px solid red", backgroundColor: "red", padding: "0px" }}
                              title={
                                new Date(room.bookings[j].rooms[k].arrivalTime).toLocaleString("en-GB") +
                                " to " +
                                new Date(room.bookings[j].rooms[k].checkoutTime).toLocaleString("en-GB") +
                                "\nBooking Id: " +
                                room.bookings[j].bookingId +
                                "\nCustomer: " +
                                room.bookings[j].rooms[k].name
                              }
                            ></td>
                          );
                        }
                      }
                    }
                    if (c === 0) {
                      a.push(<td style={{ border: "2px solid green", backgroundColor: "green", padding: "0%" }}></td>);
                    }
                  }

                  return (
                    <div className="col-md-3" style={{ border: "2px solid black" }} key={room.room}>
                      <table style={{ width: "100%" }}>
                        <tbody style={{ width: "100%" }}>
                          <tr style={{ height: "35px", width: "100%" }}>{a}</tr>
                        </tbody>
                      </table>
                      <button
                        className="btn btn-secondary"
                        onClick={(e) => {
                          e.preventDefault();

                          room.modal = true;
                          this.setState({});
                          console.log(room);
                        }}
                      >
                        {room.room}
                      </button>
                      <RoomModal
                        room={room}
                        show={room.modal}
                        date={this.state.date}
                        setShow={() => {
                          room.modal = false;
                          this.setState({});
                        }}
                      />
                      {/* <BookingModal
                        show={room.modal}
                        booking={room.booking}
                        roomsList={roomsList}
                        setShow={() => {
                          room.modal = false;
                          this.setState({});
                        }}
                      /> */}
                    </div>
                  );
                })}
              </div>
            </Fragment>
          </Col>
        </Row>
      </Fragment>
    );
  }
}
