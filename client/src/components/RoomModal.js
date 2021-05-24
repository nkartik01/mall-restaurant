import React, { Component, Fragment } from "react";
import { Modal } from "react-bootstrap";
import BookingModal from "./BookingModal";
export default class RoomModal extends Component {
  state = { show: [] };
  componentDidMount() {
    var show = [];
    for (var i = 0; i < this.props.bookings; i++) {
      show.push(false);
    }
    this.setState({ show });
  }
  render() {
    var today = new Date(this.props.date).setHours(0, 0, 0, 0);
    var tomorrow = today + 24 * 60 * 60 * 1000;
    var room = this.props.room;
    var show = this.state.show;
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
                style={{
                  border: "2px solid red",
                  padding: "0px",
                  margin: "0px",
                  backgroundColor: "red",
                  // width: "1px",
                }}
                title={
                  new Date(
                    room.bookings[j].rooms[k].arrivalTime
                  ).toLocaleString("en-GB") +
                  " to " +
                  new Date(
                    room.bookings[j].rooms[k].checkoutTime
                  ).toLocaleString("en-GB") +
                  "\nBooking Id: " +
                  room.bookings[j].bookingId +
                  "\nCustomer: " +
                  room.bookings[j].rooms[k].name
                }
              >
                {""}
              </td>
            );
          }
        }
      }
      if (c === 0) {
        a.push(
          <td
            style={{
              border: "2px solid green",
              padding: "0px",
              margin: "0px",
              backgroundColor: "green",
              // width: "1px",
            }}
          >
            {""}
          </td>
        );
      }
    }
    return (
      <Modal
        show={this.props.show}
        onHide={() => {
          this.props.setShow();
        }}
        size="xl"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            Room: {room.room} - Date:{" "}
            {new Date(this.props.date).toLocaleDateString("en-GB")}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <table style={{ width: "100%" }}>
            <tbody style={{ width: "100%" }}>
              <tr style={{ width: "100%", overflow: "scroll", height: "50px" }}>
                {a}
              </tr>
            </tbody>
          </table>
          {room.bookings.length === 0 ? <p>No bookings for the day</p> : null}
          {room.bookings.map((booking, i) => {
            if (!booking.bookedRooms) {
              booking.bookedRooms = [{ label: room.room, value: room.room }];
            }
            if (!booking.rooms) {
              booking.rooms = booking.bookedRooms;
            }
            return (
              <Fragment>
                <button
                  className="btn btn-secondary"
                  onClick={(e) => {
                    e.preventDefault();
                    show[i] = true;
                    this.setState({});
                  }}
                >
                  <div>
                    <h5>Booking Id: {booking.bookingId}</h5>
                    <p>Customer Name: {booking.rooms[0].name}</p>
                  </div>
                </button>
                <BookingModal
                  booking={booking}
                  show={show[i]}
                  setShow={() => {
                    show[i] = false;
                    this.setState({});
                  }}
                />
              </Fragment>
            );
          })}
        </Modal.Body>
      </Modal>
    );
  }
}
