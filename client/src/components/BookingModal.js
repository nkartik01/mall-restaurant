import React, { Component, Fragment } from "react";
import { Col, Row, Modal, Accordion, Card } from "react-bootstrap";
import Select from "react-select";
import axios from "axios";
import Webcam from "react-webcam";
import AlertDiv from "../AlertDiv";
import GRCPrint from "./GRCPrint";
export default class BookingModal extends Component {
  state = {
    picOf: "photo",
    date: new Date(),
    today: new Date(),
    tomorrow: new Date(new Date().getTime() + 24 * 60 * 60 * 1000),
    roomsList: [],
  };
  webcamRef1 = React.createRef();
  webcamRef2 = React.createRef();
  webcamRef3 = React.createRef();
  getRooms = async () => {
    var res = await axios.get(localStorage.getItem("apiUrl") + "booking/rooms");
    res = res.data;
    var roomsList = [];
    res.rooms.map((room) => {
      roomsList.push({ value: room, label: room });
      return null;
    });
    this.setState({ roomsList });
  };
  componentDidMount() {
    this.getRooms();
  }
  render() {
    var x = 0;
    var booking = this.props.booking;
    console.log(booking);
    var roomsList = this.state.roomsList;
    if (!booking.bills) booking.bills = [];
    return (
      <Modal
        show={this.props.show}
        onHide={() => {
          this.props.setShow();
        }}
        size="xl"
      >
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            var x = [];
            booking.rooms = booking.rooms.map((room) => {
              x.push({
                arrivalTime: room.arrivalTime,
                checkoutTime: room.checkoutTime,
              });
              room.arrivalTime = new Date(room.arrivalTime).valueOf();
              room.checkoutTime = new Date(room.checkoutTime).valueOf();
              return room;
            });
            try {
              var res = await axios.post(
                localStorage.getItem("apiUrl") + "booking/editbooking",
                { ...booking }
              );
              booking.bookingId = res.data.bookingId;
              // this.setState({});
              await AlertDiv("green", "Booking Successfully modified");
              this.props.update();
            } catch (err) {
              console.log(err, err.response);
              AlertDiv("red", err.response.data);
            } finally {
              x.map((q, i) => {
                booking.rooms[i] = { ...booking.rooms, ...q };
                return 0;
              });
            }
          }}
        >
          <Modal.Header closeButton>
            <Modal.Title>Booking Id: {booking.bookingId}</Modal.Title>
            <button
              className="btn btn-primary"
              onClick={(e) => {
                e.preventDefault();
                if (
                  window.confirm(
                    "Do you want to copy the details from an existing room in this booking?"
                  )
                ) {
                  var string = "Choose the room you want to import data from: ";
                  for (var i = 0; i < booking.rooms.length; i++) {
                    try {
                      string =
                        string +
                        "\n" +
                        (i + 1).toString() +
                        ": " +
                        booking.rooms[i].room.label;
                    } catch {}
                  }
                  var x = window.prompt(string);
                  if (parseInt(x) > 0 && parseInt(x) <= booking.rooms.length) {
                    booking.rooms.push({ ...booking.rooms[parseInt(x) - 1] });
                  }
                } else {
                  booking.rooms.push({});
                }
                this.setState({});
              }}
            >
              Add new room
            </button>
          </Modal.Header>

          <Modal.Body>
            <Accordion>
              <Accordion.Toggle
                eventKey="bills"
                as={Card.Header}
                style={{
                  backgroundColor: "green",
                  color: "white",
                  fontWeight: "bold",
                  border: "2px solid black",
                  borderRadius: "5px",
                }}
                align="center"
              >
                Bills
              </Accordion.Toggle>
              <Accordion.Collapse eventKey="bills" style={{ width: "95%" }}>
                <table className="table table-bordered">
                  <thead>
                    <tr>
                      <th scope="col">Sr. No.</th>
                      <th scope="col">Bill No.</th>
                      <th scope="col">Time</th>
                      <th scope="col">Amount</th>
                      <th scope="col">Operator</th>
                    </tr>
                  </thead>
                  <tbody>
                    {booking.bills.map((bill, billInd) => {
                      return (
                        <tr key={billInd}>
                          <th scope="row">{(billInd + 1).toString()}</th>
                          <td>{bill.bill}</td>
                          <td>{new Date(bill.at).toLocaleString("en-GB")}</td>
                          <td>{bill.amount}</td>
                          <td>{bill.by}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </Accordion.Collapse>
              <Accordion.Toggle
                eventKey="rooms"
                as={Card.Header}
                style={{
                  backgroundColor: "green",
                  color: "white",
                  fontWeight: "bold",
                  border: "2px solid black",
                  borderRadius: "5px",
                }}
                align="center"
              >
                Rooms
              </Accordion.Toggle>
              <Accordion.Collapse
                as={Card.Header}
                eventKey="rooms"
                style={{ width: "95%" }}
              >
                <Accordion defaultActiveKey="x">
                  {booking.rooms.map((room, roomInd) => {
                    if (!room.arrivalTime) {
                      room.arrivalTime =
                        this.state.today.getFullYear().toString() +
                        "-" +
                        (this.state.today.getMonth() + 1)
                          .toString()
                          .padStart(2, 0) +
                        "-" +
                        this.state.today.getDate().toString().padStart(2, 0) +
                        "T12:00";
                    }
                    if (!room.checkoutTime) {
                      room.checkoutTime =
                        this.state.tomorrow.getFullYear().toString() +
                        "-" +
                        (this.state.tomorrow.getMonth() + 1)
                          .toString()
                          .padStart(2, 0) +
                        "-" +
                        this.state.tomorrow
                          .getDate()
                          .toString()
                          .padStart(2, 0) +
                        "T11:59";
                    }
                    if (!room.bookingDate) {
                      room.bookingDate =
                        this.state.today.getFullYear().toString() +
                        "-" +
                        (this.state.today.getMonth() + 1)
                          .toString()
                          .padStart(2, 0) +
                        "-" +
                        this.state.today.getDate().toString().padStart(2, 0);
                    }

                    return (
                      <Card key={roomInd}>
                        <div className="row">
                          <Accordion.Toggle
                            as={Card.Header}
                            eventKey={roomInd.toString()}
                            style={{ width: "95%" }}
                          >
                            {room.room ? room.room.label : ""}
                          </Accordion.Toggle>
                          <button
                            className="btn btn-secondary"
                            style={{
                              align: "right",
                              minWidth: "fit-content",
                              maxWidth: "5%",
                            }}
                            onClick={(e) => {
                              e.preventDefault();
                              if (
                                !window.confirm(
                                  "Are you sure you want to remove this room?"
                                )
                              ) {
                                return;
                              }
                              booking.rooms.splice(roomInd, 1);
                              this.setState({});
                            }}
                          >
                            x
                          </button>
                        </div>
                        <Accordion.Collapse eventKey={roomInd.toString()}>
                          <Card.Body>
                            <Row>
                              <Col sm={10}>
                                <div className="row">
                                  <div className="col-md-6">
                                    <div className="form-group">
                                      <label htmlFor="name">
                                        Name of Customer
                                      </label>
                                      <input
                                        type="text"
                                        className="form-control"
                                        value={room.name}
                                        name="name"
                                        id="name"
                                        onChange={(e) => {
                                          e.preventDefault();
                                          room.name = e.target.value;
                                          this.setState({});
                                        }}
                                        required
                                        placeholder="Name"
                                      />
                                    </div>
                                  </div>
                                  <div className="col-md-4">
                                    <div className="form-group">
                                      <label htmlFor="company">
                                        Company Name
                                      </label>
                                      <input
                                        type="text"
                                        className="form-control"
                                        value={room.company}
                                        name="company"
                                        id="company"
                                        onChange={(e) => {
                                          e.preventDefault();
                                          room.company = e.target.value;
                                          this.setState({});
                                        }}
                                        placeholder="Company Name"
                                      />
                                    </div>
                                  </div>
                                </div>
                                <div className="row">
                                  <div className="col-md-9">
                                    <div className="form-group">
                                      <label htmlFor="name">
                                        Customer Address
                                      </label>
                                      <input
                                        type="text"
                                        value={room.address}
                                        name="address"
                                        id="address"
                                        className="form-control"
                                        onChange={(e) => {
                                          e.preventDefault();

                                          room.address = e.target.value;
                                          this.setState({});
                                        }}
                                        placeholder="address"
                                      />
                                    </div>
                                  </div>
                                  <div className="col-md-3">
                                    <div className="form-group">
                                      <label htmlFor="gstin">GST In</label>
                                      <input
                                        type="text"
                                        className="form-control"
                                        value={room.gstin}
                                        name="gstin"
                                        id="gstin"
                                        onChange={(e) => {
                                          e.preventDefault();
                                          room.gstin = e.target.value;
                                          this.setState({});
                                        }}
                                        placeholder="GST In"
                                      />
                                    </div>
                                  </div>
                                </div>
                                <div className="row">
                                  <div className="col-md-4">
                                    <div className="form-group">
                                      <label>Date of Birth</label>
                                      <input
                                        type="date"
                                        className="form-control"
                                        placeholder="Date of Birth"
                                        name="dob"
                                        onChange={(e) => {
                                          e.preventDefault();
                                          room.dob = e.target.value;
                                          this.setState({});
                                        }}
                                        value={room.dob}
                                      />
                                    </div>
                                  </div>
                                  <div className="col-md-4">
                                    <div className="form-group">
                                      <label>Date of Anniversary</label>
                                      <input
                                        type="date"
                                        className="form-control"
                                        placeholder="Date of Anniversary"
                                        name="doa"
                                        onChange={(e) => {
                                          e.preventDefault();
                                          room.doa = e.target.value;
                                          this.setState({});
                                        }}
                                        value={room.doa}
                                      />
                                    </div>
                                  </div>
                                  <div className="col-md-4">
                                    <div className="form-group">
                                      <label htmlFor="from">
                                        Vehicle Number
                                      </label>
                                      <input
                                        type="text"
                                        value={room.vehicleNumber}
                                        name="vehicle"
                                        id="vehicle"
                                        className="form-control"
                                        onChange={(e) => {
                                          e.preventDefault();

                                          room.vehicleNumber = e.target.value;
                                          this.setState({});
                                        }}
                                        placeholder="Vehicle Number"
                                      />
                                    </div>
                                  </div>
                                </div>
                                <div className="row">
                                  <div className="col-md-4">
                                    <div className="form-group">
                                      <label htmlFor="name">
                                        Customer Phone
                                      </label>

                                      <input
                                        type="number"
                                        value={room.mobile}
                                        name="mobile"
                                        id="mobile"
                                        className="form-control"
                                        onChange={(e) => {
                                          e.preventDefault();

                                          room.mobile = e.target.value;
                                          this.setState({});
                                        }}
                                        required
                                        placeholder="mobile"
                                      />
                                    </div>
                                  </div>
                                  <div className="col-md-4">
                                    <div className="form-group">
                                      <label htmlFor="name">Email</label>

                                      <input
                                        type="text"
                                        value={room.email}
                                        name="email"
                                        id="email"
                                        className="form-control"
                                        onChange={(e) => {
                                          e.preventDefault();

                                          room.email = e.target.value;
                                          this.setState({});
                                        }}
                                        placeholder="email"
                                      />
                                    </div>
                                  </div>
                                  <div className="col-md-4">
                                    <div className="form-group">
                                      <label htmlFor="name">Nationality</label>

                                      <input
                                        type="text"
                                        value={room.nationality}
                                        name="nationality"
                                        id="nationality"
                                        className="form-control"
                                        onChange={(e) => {
                                          e.preventDefault();

                                          room.nationality = e.target.value;
                                          this.setState({});
                                        }}
                                        placeholder="nationality"
                                      />
                                    </div>
                                  </div>
                                </div>
                                <div className="row">
                                  <div className="col-md-3">
                                    <div className="form-group">
                                      <label htmlFor="room">Room Number</label>

                                      <Select
                                        options={roomsList}
                                        // isMulti
                                        value={room.room}
                                        onChange={(e) => {
                                          // console.log(e);
                                          room.room = e;
                                          this.setState({});
                                        }}
                                      />
                                    </div>
                                  </div>
                                  <div className="col-md-3">
                                    <div className="form-group">
                                      <label htmlFor="name">Room Rate</label>
                                      <input
                                        type="number"
                                        value={room.roomRate}
                                        name="roomRate"
                                        id="roomRate"
                                        className="form-control"
                                        onChange={(e) => {
                                          e.preventDefault();
                                          room.roomRate = e.target.value;
                                          this.setState({});
                                        }}
                                        required
                                        placeholder="roomRate"
                                      />
                                    </div>
                                  </div>
                                  <div className="col-md-2">
                                    <div className="form-group">
                                      <label htmlFor="gstIncluded">
                                        GST Included
                                      </label>
                                      <br />
                                      <label className="switch">
                                        <input
                                          type="checkbox"
                                          checked={room.gstIncluded}
                                          name="gstIncluded"
                                          id="gstIncluded"
                                          onChange={(e) => {
                                            // console.log(e.ta)

                                            room.gstIncluded = e.target.checked;
                                            console.log(room.gstIncluded);
                                            this.setState({});
                                          }}
                                          placeholder="gstIncluded"
                                        />
                                        <span className="slider round"></span>
                                      </label>
                                    </div>
                                  </div>
                                  <div className="col-md-3">
                                    <div className="form-group">
                                      <label htmlFor="name">
                                        Date of booking
                                      </label>
                                      <input
                                        type="date"
                                        defaultValue={
                                          this.state.today
                                            .getFullYear()
                                            .toString() +
                                          "-" +
                                          (this.state.today.getMonth() + 1)
                                            .toString()
                                            .padStart(2, 0) +
                                          "-" +
                                          this.state.today
                                            .getDate()
                                            .toString()
                                            .padStart(2, 0)
                                        }
                                        value={room.bookingDate}
                                        name="bookingDate"
                                        id="bookingDate"
                                        className="form-control"
                                        onChange={(e) => {
                                          e.preventDefault();

                                          room.bookingDate = e.target.value;
                                          this.setState({});
                                        }}
                                        required
                                        placeholder="Booking Date"
                                      />
                                    </div>
                                  </div>
                                </div>
                                <div className="row">
                                  <div className="col-md-6">
                                    <div className="form-group">
                                      <label htmlFor="name">Arrival Date</label>
                                      <input
                                        type="datetime-local"
                                        value={room.arrivalTime}
                                        name="arrivalTime"
                                        id="arrivalTime"
                                        className="form-control"
                                        onChange={(e) => {
                                          e.preventDefault();
                                          console.log(
                                            new Date(
                                              e.target.value
                                            ).toLocaleString()
                                          );
                                          room.arrivalTime = e.target.value;
                                          this.setState({});
                                        }}
                                        required
                                        placeholder="arrivalTime"
                                      />
                                    </div>
                                  </div>
                                  <div className="col-md-6">
                                    <div className="form-group">
                                      <label htmlFor="name">
                                        Checkout Time
                                      </label>
                                      <input
                                        min={room.arrivalTime}
                                        type="datetime-local"
                                        value={room.checkoutTime}
                                        name="checkoutTime"
                                        id="checkoutTime"
                                        className="form-control"
                                        onChange={(e) => {
                                          e.preventDefault();

                                          room.checkoutTime = e.target.value;
                                          this.setState({});
                                        }}
                                        required
                                        placeholder="checkoutTime"
                                      />
                                    </div>
                                  </div>
                                </div>
                                <div className="row">
                                  <div className="col-md-2">
                                    <div className="form-group">
                                      <label htmlFor="name">Males</label>

                                      <input
                                        type="number"
                                        value={room.male}
                                        name="male"
                                        id="male"
                                        className="form-control"
                                        onChange={(e) => {
                                          e.preventDefault();

                                          room.male = e.target.value;
                                          this.setState({});
                                        }}
                                        placeholder="male"
                                      />
                                    </div>
                                  </div>
                                  <div className="col-md-2">
                                    <div className="form-group">
                                      <label htmlFor="name">Females</label>

                                      <input
                                        type="number"
                                        value={room.female}
                                        name="female"
                                        id="female"
                                        className="form-control"
                                        onChange={(e) => {
                                          e.preventDefault();

                                          room.female = e.target.value;
                                          this.setState({});
                                        }}
                                        placeholder="female"
                                      />
                                    </div>
                                  </div>
                                  <div className="col-md-2">
                                    <div className="form-group">
                                      <label htmlFor="name">Children</label>

                                      <input
                                        type="number"
                                        value={room.children}
                                        name="children"
                                        id="children"
                                        className="form-control"
                                        onChange={(e) => {
                                          e.preventDefault();

                                          room.children = e.target.value;
                                          this.setState({});
                                        }}
                                        placeholder="children"
                                      />
                                    </div>
                                  </div>
                                  <div className="form-group col-md-2">
                                    <label htmlFor="extraBed">Extra Bed</label>

                                    <label className="switch">
                                      <input
                                        type="checkbox"
                                        checked={room.extraBed}
                                        name="extraBed"
                                        id="extraBed"
                                        onChange={(e) => {
                                          // console.log(e.ta)

                                          room.extraBed = e.target.checked;
                                          console.log(room.extraBed);
                                          this.setState({});
                                        }}
                                        placeholder="extraBed"
                                      />
                                      <span className="slider round"></span>
                                    </label>
                                  </div>
                                  <div className="col-md-2">
                                    <div className="form-group">
                                      <label htmlFor="extraBedCost">
                                        Cost of Extra Bed
                                      </label>
                                      <input
                                        disabled={!room.extraBed}
                                        type="number"
                                        value={room.extraBedCost}
                                        name="extraBedCost"
                                        id="extraBedCost"
                                        className="form-control"
                                        onChange={(e) => {
                                          e.preventDefault();

                                          room.extraBedCost = e.target.value;
                                          this.setState({});
                                        }}
                                        placeholder="extraBedCost"
                                      />
                                    </div>
                                  </div>
                                  <div className="col-md-2">
                                    <div className="form-group">
                                      <label htmlFor="extraBedNumber">
                                        Number of beds
                                      </label>
                                      <input
                                        disabled={!room.extraBed}
                                        type="number"
                                        value={room.extraBedNumber}
                                        name="extraBedNumber"
                                        id="extraBedNumber"
                                        className="form-control"
                                        onChange={(e) => {
                                          e.preventDefault();

                                          room.extraBedNumber = e.target.value;
                                          this.setState({});
                                        }}
                                        placeholder="extraBedNumber"
                                      />
                                    </div>
                                  </div>
                                </div>
                              </Col>
                              <Col sm={2}>
                                <div>
                                  {/* <h5>{this.state.picOf}</h5> */}
                                  {room.photo ? (
                                    <Fragment>
                                      <img src={room.photo} alt="not found" />
                                      <button
                                        onClick={(e) => {
                                          e.preventDefault();
                                          delete room.photo;
                                          this.setState({});
                                        }}
                                      >
                                        Retake Photo
                                      </button>
                                    </Fragment>
                                  ) : (
                                    <Fragment>
                                      <Webcam
                                        style={{ width: "100%" }}
                                        audio={false}
                                        ref={this.webcamRef1}
                                        screenshotFormat="image/jpeg"
                                        videoConstraints={{
                                          facingMode: "user",

                                          aspectRatio: 0.79,
                                        }}
                                      />
                                      <button
                                        onClick={(e) => {
                                          e.preventDefault();
                                          const imageSrc =
                                            this.webcamRef1.current.getScreenshot();

                                          room.photo = imageSrc;
                                          console.log(room);
                                          this.setState({});
                                        }}
                                      >
                                        Capture Photo
                                      </button>
                                    </Fragment>
                                  )}
                                </div>
                              </Col>
                            </Row>
                            <div className="row">
                              <div className="col-md-3">
                                <div className="form-group">
                                  <label htmlFor="from">Coming From</label>
                                  <input
                                    type="text"
                                    value={room.from}
                                    name="from"
                                    id="from"
                                    className="form-control"
                                    onChange={(e) => {
                                      e.preventDefault();

                                      room.from = e.target.value;
                                      this.setState({});
                                    }}
                                    placeholder="from"
                                  />
                                </div>
                              </div>
                              <div className="col-md-3">
                                <div className="form-group">
                                  <label htmlFor="from">Going To</label>
                                  <input
                                    type="text"
                                    value={room.to}
                                    name="to"
                                    id="to"
                                    className="form-control"
                                    onChange={(e) => {
                                      e.preventDefault();

                                      room.to = e.target.value;
                                      this.setState({});
                                    }}
                                    placeholder="to"
                                  />
                                </div>
                              </div>
                              <div className="col-md-1">
                                <div className="form-group">
                                  <label htmlFor="breakfast">Breakfast</label>

                                  <label className="switch">
                                    <input
                                      type="checkbox"
                                      checked={room.breakfast}
                                      name="breakfast"
                                      id="breakfast"
                                      onChange={(e) => {
                                        // console.log(e.ta)

                                        room.breakfast = e.target.checked;
                                        console.log(room.breakfast);
                                        this.setState({});
                                      }}
                                      placeholder="breakfast"
                                    />
                                    <span className="slider round"></span>
                                  </label>
                                </div>
                              </div>
                              <div className=" col-md-1">
                                <div className="form-group">
                                  <label htmlFor="dinner"> Dinner </label>
                                  <label className="switch">
                                    <input
                                      type="checkbox"
                                      checked={room.dinner}
                                      name="dinner"
                                      id="dinner"
                                      onChange={(e) => {
                                        // console.log(e.ta)

                                        room.dinner = e.target.checked;
                                        console.log(room.dinner);
                                        this.setState({});
                                      }}
                                      placeholder="dinner"
                                    />
                                    <span className="slider round"></span>
                                  </label>
                                </div>
                              </div>
                              <div className="col-md-1">
                                <div className="form-group">
                                  <label htmlFor="dj">DJ</label>
                                  <label className="switch">
                                    <input
                                      type="checkbox"
                                      checked={room.dj}
                                      name="dj"
                                      id="dj"
                                      onChange={(e) => {
                                        // console.log(e.ta)

                                        room.dj = e.target.checked;
                                        console.log(room.dj);
                                        this.setState({});
                                      }}
                                      placeholder="DJ"
                                    />
                                    <span className="slider round"></span>
                                  </label>
                                </div>
                              </div>
                              <div className="col-md-1">
                                <div className="form-group">
                                  <label htmlFor="ac">AC</label>
                                  <label className="switch">
                                    <input
                                      type="checkbox"
                                      checked={room.ac}
                                      name="ac"
                                      id="ac"
                                      onChange={(e) => {
                                        // console.log(e.ta)

                                        room.ac = e.target.checked;
                                        console.log(room.ac);
                                        this.setState({});
                                      }}
                                      placeholder="AC"
                                    />
                                    <span className="slider round"></span>
                                  </label>
                                </div>
                              </div>
                              <div className="col-md-1">
                                <div className="form-group">
                                  <label htmlFor="flower">Flowers</label>
                                  <label className="switch">
                                    <input
                                      type="checkbox"
                                      checked={room.flower}
                                      name="flower"
                                      id="flower"
                                      onChange={(e) => {
                                        // console.log(e.ta)

                                        room.flower = e.target.checked;
                                        console.log(room.flower);
                                        this.setState({});
                                      }}
                                      placeholder="Flowers"
                                    />
                                    <span className="slider round"></span>
                                  </label>
                                </div>
                              </div>
                              <div className="col-md-1">
                                <div className="form-group">
                                  <label htmlFor="lights">Lights</label>
                                  <label className="switch">
                                    <input
                                      type="checkbox"
                                      checked={room.lights}
                                      name="lights"
                                      id="lights"
                                      onChange={(e) => {
                                        // console.log(e.ta)

                                        room.lights = e.target.checked;
                                        console.log(room.lights);
                                        this.setState({});
                                      }}
                                      placeholder="Lights"
                                    />
                                    <span className="slider round"></span>
                                  </label>
                                </div>
                              </div>
                            </div>
                            <div className="row">
                              <div className="col-md-3">
                                <div className="form-group">
                                  <label>Passport Number</label>
                                  <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Passport Number"
                                    value={room.passportNumber}
                                    onChange={(e) => {
                                      e.preventDefault();
                                      room.passportNumber = e.target.value;
                                      this.setState({});
                                    }}
                                  />
                                </div>
                              </div>
                              <div className="col-md-3">
                                <div className="form-group">
                                  <label>Date of Issue</label>
                                  <input
                                    type="date"
                                    value={room.passportDateOfIssue}
                                    className="form-control"
                                    placeholder="Date of Issue"
                                    onChange={(e) => {
                                      e.preventDefault();
                                      room.passportDateOfIssue = e.target.value;
                                      this.setState({});
                                    }}
                                  />
                                </div>
                              </div>
                              <div className="col-md-3">
                                <div className="form-group">
                                  <label>Place of Issue</label>
                                  <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Place of Issue"
                                    onChange={(e) => {
                                      e.preventDefault();
                                      room.passportPlaceOfIssue =
                                        e.target.value;
                                      this.setState({});
                                    }}
                                    value={room.passportPlaceOfIssue}
                                  />
                                </div>
                              </div>
                              <div className="col-md-3">
                                <div className="form-group">
                                  <label>Valid Upto</label>
                                  <input
                                    type="date"
                                    className="form-control"
                                    placeholder="Valid Upto"
                                    onChange={(e) => {
                                      e.preventDefault();
                                      room.passportValidUpto = e.target.value;
                                      this.setState({});
                                    }}
                                    value={room.passportValidUpto}
                                  />
                                </div>
                              </div>
                            </div>
                            <div className="row">
                              <div className="col-md-3">
                                <div className="form-group">
                                  <label>Visa Number</label>
                                  <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Visa Number"
                                    value={room.visaNumber}
                                    onChange={(e) => {
                                      e.preventDefault();
                                      room.visaNumber = e.target.value;
                                      this.setState({});
                                    }}
                                  />
                                </div>
                              </div>
                              <div className="col-md-3">
                                <div className="form-group">
                                  <label>Date of Issue</label>
                                  <input
                                    type="date"
                                    value={room.visaDateOfIssue}
                                    className="form-control"
                                    placeholder="Date of Issue"
                                    onChange={(e) => {
                                      e.preventDefault();
                                      room.visaDateOfIssue = e.target.value;
                                      this.setState({});
                                    }}
                                  />
                                </div>
                              </div>
                              <div className="col-md-3">
                                <div className="form-group">
                                  <label>Place of Issue</label>
                                  <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Place of Issue"
                                    onChange={(e) => {
                                      e.preventDefault();
                                      room.visaPlaceOfIssue = e.target.value;
                                      this.setState({});
                                    }}
                                    value={room.visaPlaceOfIssue}
                                  />
                                </div>
                              </div>
                              <div className="col-md-3">
                                <div className="form-group">
                                  <label>Valid Upto</label>
                                  <input
                                    type="date"
                                    className="form-control"
                                    placeholder="Valid Upto"
                                    onChange={(e) => {
                                      e.preventDefault();
                                      room.visaValidUpto = e.target.value;
                                      this.setState({});
                                    }}
                                    value={room.visaValidUpto}
                                  />
                                </div>
                              </div>
                              <div className="col-md-3">
                                <div className="form-group">
                                  <label>Arrival In India</label>
                                  <input
                                    type="date"
                                    className="form-control"
                                    placeholder="Arrival In India"
                                    onChange={(e) => {
                                      e.preventDefault();
                                      room.arrivalInIndia = e.target.value;
                                      this.setState({});
                                    }}
                                    value={room.arrivalInIndia}
                                  />
                                </div>
                              </div>
                            </div>
                            <div className="row">
                              <div className="col-md-6">
                                {room.idFront ? (
                                  <Fragment>
                                    <img src={room.idFront} alt="not found" />
                                    <button
                                      onClick={(e) => {
                                        e.preventDefault();
                                        delete room.idFront;
                                        this.setState({});
                                      }}
                                    >
                                      Retake ID front
                                    </button>
                                  </Fragment>
                                ) : (
                                  <Fragment>
                                    <Webcam
                                      style={{ width: "100%" }}
                                      audio={false}
                                      ref={this.webcamRef2}
                                      screenshotFormat="image/jpeg"
                                      videoConstraints={{
                                        facingMode: "user",

                                        aspectRatio: 2,
                                      }}
                                    />
                                    <button
                                      onClick={(e) => {
                                        e.preventDefault();
                                        const imageSrc =
                                          this.webcamRef2.current.getScreenshot();

                                        room.idFront = imageSrc;
                                        console.log(room);
                                        this.setState({});
                                      }}
                                    >
                                      Capture ID Front
                                    </button>
                                  </Fragment>
                                )}
                              </div>
                              <div className="col-md-6">
                                {room.idBack ? (
                                  <Fragment>
                                    <img src={room.idBack} alt="not found" />
                                    <button
                                      onClick={(e) => {
                                        e.preventDefault();
                                        delete room.idBack;
                                        this.setState({});
                                      }}
                                    >
                                      Retake ID Back
                                    </button>
                                  </Fragment>
                                ) : (
                                  <Fragment>
                                    <Webcam
                                      style={{ width: "100%" }}
                                      audio={false}
                                      ref={this.webcamRef3}
                                      screenshotFormat="image/jpeg"
                                      videoConstraints={{
                                        facingMode: "user",

                                        aspectRatio: 2,
                                      }}
                                    />
                                    <button
                                      onClick={(e) => {
                                        e.preventDefault();
                                        const imageSrc =
                                          this.webcamRef3.current.getScreenshot();

                                        room.idBack = imageSrc;
                                        console.log(room);
                                        this.setState({});
                                      }}
                                    >
                                      Capture id Back
                                    </button>
                                  </Fragment>
                                )}
                              </div>
                            </div>
                            <GRCPrint data={{ room, booking }} />
                          </Card.Body>
                        </Accordion.Collapse>
                      </Card>
                    );
                  })}
                </Accordion>
              </Accordion.Collapse>
              <Accordion.Toggle
                eventKey="payment"
                as={Card.Header}
                style={{
                  backgroundColor: "green",
                  color: "white",
                  fontWeight: "bold",
                  border: "2px solid black",
                  borderRadius: "5px",
                }}
                align="center"
              >
                Payment
              </Accordion.Toggle>
              <Accordion.Collapse
                as={Card.Header}
                eventKey="payment"
                style={{ width: "95%" }}
              >
                <table style={{ width: "100%" }} className="table-bordered">
                  <thead>
                    <tr>
                      <th>Sr.</th>
                      <th>Particular</th>
                      <th>Price</th>
                      <th>Quantity</th>
                      <th>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {booking.rooms.map((room) => {
                      x = x + 1;
                      return (
                        <tr>
                          <td>{x}</td>
                          <td>
                            {room.room ? room.room.label : ""} (
                            {new Date(room.arrivalTime).toLocaleString("en-GB")}{" "}
                            to{" "}
                            {new Date(room.checkoutTime).toLocaleString(
                              "en-GB"
                            )}
                            )
                          </td>
                          <td>{room.roomRate}</td>
                          <td>
                            {parseInt(
                              (new Date(room.checkoutTime).valueOf() -
                                new Date(room.arrivalTime).valueOf()) /
                                (1000 * 60 * 60 * 24) +
                                1,
                              10
                            )}
                          </td>
                          <td>
                            {parseInt(
                              (new Date(room.checkoutTime).valueOf() -
                                new Date(room.arrivalTime).valueOf()) /
                                (1000 * 60 * 60 * 24) +
                                1,
                              10
                            ) * parseInt(room.roomRate)}
                          </td>
                        </tr>
                      );
                    })}
                    {booking.bills.map((bill) => {
                      x = x + 1;
                      return (
                        <tr>
                          <td>{x}</td>
                          <td>
                            {bill.bill} (
                            {new Date(bill.at).toLocaleString("en-GB")})
                          </td>
                          <td>{bill.amount}</td>
                          <td>1</td>
                          <td>{bill.amount}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </Accordion.Collapse>
            </Accordion>
          </Modal.Body>

          <Modal.Footer>
            <button
              className="btn btn-danger"
              onClick={(e) => {
                e.preventDefault();
              }}
            >
              Cancel Booking
            </button>
            <button
              className="btn btn-primary"
              onClick={async (e) => {
                e.preventDefault();
                axios.post(
                  localStorage.getItem("apiUrl") + "booking/checkout",
                  { bookingId: booking.bookingId }
                );
                window.open("/#/bill/H-" + booking.bookingId, "__self");
              }}
            >
              Update Bill
            </button>
            <input type="submit" value="Submit" className="btn btn-primary" />
            {/* <Button variant="secondary">Close</Button>
    <Button variant="primary">Save changes</Button> */}
          </Modal.Footer>
        </form>
      </Modal>
    );
  }
}
