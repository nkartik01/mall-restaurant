import React, { Component, Fragment } from "react";

import { Col, Row, Modal, Accordion, Card } from "react-bootstrap";
import Select from "react-select";
import axios from "axios";
import Webcam from "react-webcam";
import AlertDiv from "../AlertDiv";
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
  getRooms = async () => {
    var res = await axios.get(require("../config.json").url + "booking/rooms");
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
    var booking = this.props.booking;
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
                require("../config.json").url + "booking/editbooking",
                { ...booking }
              );
              booking.bookingId = res.data.bookingId;
              this.setState({});
              AlertDiv("green", "Booking Successfully modified");
            } catch (err) {
              console.log(err, err.response);
              AlertDiv("red", err.response.data);
            } finally {
              x.map((q, i) => {
                booking.rooms[i] = { ...booking.rooms, ...q };
                return 0;
              });
              this.setState({});
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
                        <tr>
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

                    return (
                      <Card>
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
                              <Col sm={8}>
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
                                  <div className="col-md-6">
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
                                  <div className="col-md-6">
                                    <div className="form-group">
                                      <label htmlFor="name">room Rate</label>
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
                                  <div className="col-md-4">
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
                                <div className="form-group">
                                  <label htmlFor="name">Customer Address</label>
                                  <textarea
                                    value={room.address}
                                    name="address"
                                    id="address"
                                    className="form-control"
                                    onChange={(e) => {
                                      e.preventDefault();

                                      room.address = e.target.value;
                                      this.setState({});
                                    }}
                                    required
                                    placeholder="address"
                                  />
                                </div>
                                <div className="row">
                                  <div className="col-md-4">
                                    <div className="form-group">
                                      <label htmlFor="name">
                                        Customer City
                                      </label>
                                      <input
                                        type="text"
                                        value={room.city}
                                        name="city"
                                        id="city"
                                        className="form-control"
                                        onChange={(e) => {
                                          e.preventDefault();

                                          room.city = e.target.value;
                                          this.setState({});
                                        }}
                                        required
                                        placeholder="city"
                                      />
                                    </div>
                                  </div>
                                  <div className="col-md-8">
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
                                </div>
                                <div className="row">
                                  <div className="col-md-4">
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
                                        required
                                        placeholder="male"
                                      />
                                    </div>
                                  </div>
                                  <div className="col-md-4">
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
                                        required
                                        placeholder="female"
                                      />
                                    </div>
                                  </div>
                                  <div className="col-md-4">
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
                                        required
                                        placeholder="children"
                                      />
                                    </div>
                                  </div>
                                </div>
                                <div className="row">
                                  <div className="col-md-9">
                                    <div className="form-group">
                                      <label htmlFor="name">
                                        Extra Bedding
                                      </label>

                                      <div className="row">
                                        <div className="col-md-3">
                                          <label className="switch">
                                            <input
                                              type="checkbox"
                                              checked={room.extraBed}
                                              name="extraBed"
                                              id="extraBed"
                                              onChange={(e) => {
                                                // console.log(e.ta)

                                                room.extraBed =
                                                  e.target.checked;
                                                this.setState({});
                                              }}
                                              placeholder="extraBed"
                                            />
                                            <span className="slider round"></span>
                                          </label>
                                        </div>
                                        <div className="col-md-5">
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

                                                room.extraBedCost =
                                                  e.target.value;
                                                this.setState({});
                                              }}
                                              placeholder="extraBedCost"
                                            />
                                          </div>
                                        </div>
                                        <div className="col-md-4">
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

                                                room.extraBedNumber =
                                                  e.target.value;
                                                this.setState({});
                                              }}
                                              placeholder="extraBedNumber"
                                            />
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="col-md-3">
                                    <div className="row">
                                      <div className="form-group col-md-6">
                                        <label htmlFor="breakfast">
                                          Breakfast
                                        </label>

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
                                      <div className="form-group col-md-6">
                                        <label htmlFor="dinner">Dinner</label>
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
                                  </div>
                                </div>
                                <div className="row">
                                  <div className="col-md-4">
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
                                        required
                                        placeholder="from"
                                      />
                                    </div>
                                  </div>
                                  <div className="col-md-4">
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
                                        required
                                        placeholder="to"
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
                                        value={room.Vehicle}
                                        name="Vehicle"
                                        id="Vehicle"
                                        className="form-control"
                                        onChange={(e) => {
                                          e.preventDefault();

                                          room.Vehicle = e.target.value;
                                          this.setState({});
                                        }}
                                        required
                                        placeholder="Vehicle"
                                      />
                                    </div>
                                  </div>
                                  <div className="row">
                                    <div className="col-md-3">
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
                                    <div className="col-md-3">
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
                                    <div className="col-md-3">
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
                                    <div className="col-md-3">
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
                                </div>
                              </Col>
                              <Col sm={4}>
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
                                  {room.id ? (
                                    <Fragment>
                                      <img src={room.id} alt="not found" />
                                      <button
                                        onClick={(e) => {
                                          e.preventDefault();
                                          delete room.id;
                                          this.setState({});
                                        }}
                                      >
                                        Retake id
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
                                        }}
                                      />
                                      <button
                                        onClick={(e) => {
                                          e.preventDefault();
                                          const imageSrc =
                                            this.webcamRef2.current.getScreenshot();

                                          room.id = imageSrc;
                                          console.log(room);
                                          this.setState({});
                                        }}
                                      >
                                        Capture id
                                      </button>
                                    </Fragment>
                                  )}
                                </div>
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
                              </Col>
                            </Row>
                          </Card.Body>
                        </Accordion.Collapse>
                      </Card>
                    );
                  })}
                </Accordion>
              </Accordion.Collapse>
            </Accordion>
          </Modal.Body>

          <Modal.Footer>
            <input type="submit" value="Submit" className="btn btn-primary" />
            {/* <Button variant="secondary">Close</Button>
    <Button variant="primary">Save changes</Button> */}
          </Modal.Footer>
        </form>
      </Modal>
    );
  }
}
