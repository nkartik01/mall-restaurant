import React, { Component } from "react";
import BookingCalendar from "react-booking-calendar";

export default class Booking extends Component {
  state = { selected: "" };
  render() {
    const bookings = [new Date(2021, 1, 1), new Date(2021, 2, 2), new Date(2021, 2, 3), new Date(2021, 2, 9), new Date(2021, 2, 10), new Date(2021, 2, 11), new Date(2021, 2, 12)];
    return (
      <div>
        <BookingCalendar
          bookings={bookings}
          clickable={true}
          // selected={this.state.selected}
        />
        <button
          onClick={(e) => {
            e.preventDefault();
            console.log(this.state.selected);
          }}
        >
          hi
        </button>
      </div>
    );
  }
}
