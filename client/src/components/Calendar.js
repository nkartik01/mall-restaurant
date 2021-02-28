import React from "react";
import moment from "moment";
import axios from "axios";
import RoomModal from "./RoomModal";
// import { range } from "moment-range";
export default class Calendar extends React.Component {
  weekdayshort = moment.weekdaysShort();

  state = {
    showCalendarTable: true,
    showMonthTable: false,
    dateObject: moment(),
    allmonths: moment.months(),
    showYearNav: false,
    selectedDay: null,
    show: [],
  };
  getBookings = async () => {
    console.log(this.state.dateObject);
    if (!this.state.selectedDay) {
      this.state.selectedDay = Date.now();
    }
    var bookings = await axios.post(require("../config.json").url + "booking/room", { date: this.state.dateObject.valueOf(), room: this.props.room });
    bookings = bookings.data;
    console.log(bookings);
    var status = [];
    var days = [];
    for (let d = 1; d <= this.daysInMonth(); d++) {
      days.push(d);
    }
    days.map((d) => {
      var today = new Date(new Date(this.state.dateObject.valueOf()).setDate(d)).setHours(0, 0, 0, 0);
      var tomorrow = today + 24 * 60 * 60 * 1000;
      var room = this.props.room;
      var a = [];
      for (var i = today; i <= tomorrow; i = i + 600000) {
        var c = 0;
        for (var j = 0; j < bookings.dates[d].length; j++) {
          for (var k = 0; k < bookings.dates[d][j].rooms.length; k++) {
            if (!(bookings.dates[d][j].rooms[k].room.label === this.props.room)) {
              continue;
            }
            var arrival = new Date(bookings.dates[d][j].rooms[k].arrivalTime);
            var checkout = new Date(bookings.dates[d][j].rooms[k].checkoutTime);
            if (i > arrival && i < checkout) {
              c = 1;
              a.push(
                <td
                  style={{ borderRightWidth: "1px", borderTop: "30px solid red", backgroundColor: "red", padding: "0px" }}
                  title={
                    new Date(bookings.dates[d][j].rooms[k].arrivalTime).toLocaleString("en-GB") +
                    " to " +
                    new Date(bookings.dates[d][j].rooms[k].checkoutTime).toLocaleString("en-GB") +
                    "\nBooking Id: " +
                    bookings.dates[d][j].bookingId +
                    "\nCustomer: " +
                    bookings.dates[d][j].rooms[k].name
                  }
                ></td>
              );
            }
          }
        }
        if (c === 0) {
          a.push(<td style={{ borderRightWidth: "1px", borderTop: "30px solid green", backgroundColor: "green", padding: "0%" }}></td>);
        }
      }
      status.push(a);
    });
    this.setState({ bookings, status, days });
    console.log(status);
  };
  componentDidMount() {
    this.getBookings();
  }
  daysInMonth = () => {
    return this.state.dateObject.daysInMonth();
  };
  year = () => {
    return this.state.dateObject.format("Y");
  };
  currentDay = () => {
    return this.state.dateObject.format("D");
  };
  firstDayOfMonth = () => {
    let dateObject = this.state.dateObject;
    let firstDay = moment(dateObject).startOf("month").format("d"); // Day of week 0...1..5...6
    return firstDay;
  };
  month = () => {
    return this.state.dateObject.format("MMMM");
  };
  showMonth = (e, month) => {
    this.setState({
      showMonthTable: !this.state.showMonthTable,
      showCalendarTable: !this.state.showCalendarTable,
    });
  };
  setMonth = async (month) => {
    let monthNo = this.state.allmonths.indexOf(month);
    let dateObject = Object.assign({}, this.state.dateObject);
    dateObject = moment(dateObject).set("month", monthNo);
    this.setState({
      dateObject: dateObject,
      showMonthTable: !this.state.showMonthTable,
      showCalendarTable: !this.state.showCalendarTable,
    });
    const delay = (millis) =>
      new Promise((resolve, reject) => {
        setTimeout((_) => resolve(), millis);
      });
    await delay(100);
    this.getBookings();
  };
  MonthList = (props) => {
    let months = [];
    props.data.map((data) => {
      months.push(
        <td
          key={data}
          className="calendar-month"
          onClick={(e) => {
            this.setMonth(data);
          }}
        >
          <span>{data}</span>
        </td>
      );
    });
    let rows = [];
    let cells = [];

    months.forEach((row, i) => {
      if (i % 3 !== 0 || i == 0) {
        cells.push(row);
      } else {
        rows.push(cells);
        cells = [];
        cells.push(row);
      }
    });
    rows.push(cells);
    let monthlist = rows.map((d, i) => {
      return <tr>{d}</tr>;
    });

    return (
      <table className="calendar-month">
        <thead>
          <tr>
            <th colSpan="4">Select a Month</th>
          </tr>
        </thead>
        <tbody>{monthlist}</tbody>
      </table>
    );
  };
  showYearEditor = () => {
    this.setState({
      showYearNav: true,
      showCalendarTable: !this.state.showCalendarTable,
    });
  };

  onPrev = () => {
    let curr = "";
    if (this.state.showMonthTable == true) {
      curr = "year";
    } else {
      curr = "month";
    }
    this.setState({
      dateObject: this.state.dateObject.subtract(1, curr),
    });
    this.getBookings();
  };
  onNext = () => {
    let curr = "";
    if (this.state.showMonthTable == true) {
      curr = "year";
    } else {
      curr = "month";
    }
    this.setState({
      dateObject: this.state.dateObject.add(1, curr),
    });
    this.getBookings();
  };
  setYear = (year) => {
    // alert(year)
    let dateObject = Object.assign({}, this.state.dateObject);
    dateObject = moment(dateObject).set("year", year);
    this.setState({
      dateObject: dateObject,
      showMonthTable: !this.state.showMonthTable,
      showYearNav: !this.state.showYearNav,
      showMonthTable: !this.state.showMonthTable,
    });
    this.getBookings();
  };
  onYearChange = (e) => {
    this.setYear(e.target.value);
  };
  getDates(startDate, stopDate) {
    var dateArray = [];
    var currentDate = moment(startDate);
    var stopDate = moment(stopDate);
    while (currentDate <= stopDate) {
      dateArray.push(moment(currentDate).format("YYYY"));
      currentDate = moment(currentDate).add(1, "year");
    }
    return dateArray;
  }
  YearTable = (props) => {
    let months = [];
    let nextten = moment().set("year", props).add("year", 12).format("Y");

    let tenyear = this.getDates(props, nextten);

    tenyear.map((data) => {
      months.push(
        <td
          key={data}
          className="calendar-month"
          onClick={(e) => {
            this.setYear(data);
          }}
        >
          <span>{data}</span>
        </td>
      );
    });
    let rows = [];
    let cells = [];

    months.forEach((row, i) => {
      if (i % 3 !== 0 || i == 0) {
        cells.push(row);
      } else {
        rows.push(cells);
        cells = [];
        cells.push(row);
      }
    });
    rows.push(cells);
    let yearlist = rows.map((d, i) => {
      return <tr>{d}</tr>;
    });

    return (
      <table className="calendar-month">
        <thead>
          <tr>
            <th colSpan="4">Select a Year</th>
          </tr>
        </thead>
        <tbody>{yearlist}</tbody>
      </table>
    );
  };
  onDayClick = (e, d) => {
    // e.preventDefault();
    // this.setState({
    //   selectedDay: d,
    // });
    // this.getBookings();
    this.state.show[d - 1] = true;
    this.setState({});
  };
  render() {
    let weekdayshortname = this.weekdayshort.map((day) => {
      return <th key={day}>{day}</th>;
    });
    let blanks = [];
    for (let i = 0; i < this.firstDayOfMonth(); i++) {
      blanks.push(<td className="calendar-day empty">{""}</td>);
    }
    let daysInMonth = [];
    if (this.state.bookings) {
      var days = this.state.days ? this.state.days : [];
      days.map((d) => {
        if (typeof this.state.show[d - 1] === "undefined") this.state.show.push(false);
        let currentDay = d == this.currentDay() ? "today" : "";
        daysInMonth.push(
          <td key={d} className={`calendar-day ${currentDay}`}>
            <span
              onClick={(e) => {
                this.onDayClick(e, d);
              }}
              align="center"
              //   style={{ alignContent: "center" }}
            >
              {/* <table>
                <tbody> */}
              <div align="center" style={{ minWidth: "100% " }}>
                {this.state.status[d - 1]}
              </div>
              {/* </tr> */}
              {/* </tbody>
              </table> */}
              {d}
            </span>

            <RoomModal
              room={{ bookings: this.state.bookings.dates[d], room: this.props.room }}
              show={this.state.show[d - 1]}
              date={new Date(this.state.dateObject.valueOf()).setDate(d)}
              setShow={() => {
                this.state.show[d - 1] = false;
                this.setState({});
              }}
            />
          </td>
        );
      });
    }
    var totalSlots = [...blanks, ...daysInMonth];
    let rows = [];
    let cells = [];

    totalSlots.forEach((row, i) => {
      if (i % 7 !== 0) {
        cells.push(row);
      } else {
        rows.push(cells);
        cells = [];
        cells.push(row);
      }
      if (i === totalSlots.length - 1) {
        // let insertRow = cells.slice();
        rows.push(cells);
      }
    });

    let daysinmonth = rows.map((d, i) => {
      return <tr>{d}</tr>;
    });

    return (
      <div className="tail-datetime-calendar">
        <div className="calendar-navi">
          <span
            onClick={(e) => {
              this.onPrev();
            }}
            class="calendar-button button-prev"
          />
          {!this.state.showMonthTable && !this.state.showYearEditor && (
            <span
              onClick={(e) => {
                this.showMonth();
              }}
              class="calendar-label"
            >
              {this.month()},
            </span>
          )}
          <span
            className="calendar-label"
            onClick={(e) => {
              this.showYearEditor();
            }}
          >
            {this.year()}
          </span>

          <span
            onClick={(e) => {
              this.onNext();
            }}
            className="calendar-button button-next"
          />
        </div>
        <div className="calendar-date">
          {this.state.showYearNav && <this.YearTable props={this.year()} />}
          {this.state.showMonthTable && <this.MonthList data={moment.months()} />}
        </div>

        {this.state.showCalendarTable && (
          <div className="calendar-date">
            <table className="calendar-day">
              <thead>
                <tr>{weekdayshortname}</tr>
              </thead>
              <tbody>{daysinmonth}</tbody>
            </table>
          </div>
        )}
      </div>
    );
  }
}
