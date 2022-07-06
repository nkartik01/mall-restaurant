import React, { Component, Fragment } from "react";
import ReactToPrint from "react-to-print";

export default class GRCPrint extends Component {
  render() {
    var includes = ["breakfast", "dinner", "dj", "ac", "flowers", "lights"];

    var { room, booking } = this.props.data;

    includes = includes
      .filter((item) => room[item] === true)
      .map((item) => item.toUpperCase())
      .join(", ");
    return (
      <div>
        <ReactToPrint
          trigger={() => <div className="btn btn-primary">Print GRC</div>}
          content={() => this.ref}
        />
        <div
          className="noDisplay"
          ref={(e) => {
            this.ref = e;
          }}
          style={{
            width: "7.6in",
            marginTop: "0.5in",
            marginLeft: "0.4in",
            marginRight: "0.2in",
          }}
        >
          <div style={{ textAlign: "center" }}>
            <h2>HOTEL HIVE</h2>
            <h5>City Walk Mall, Hanumangarh Road, Abohar</h5>
            <h6>A Unit of RDESCO City Walk Pvt. Ltd.</h6>
          </div>
          <div className="row">
            <div className="col-5" style={{ textAlign: "left" }}>
              GSTIN: 03AAICR8822Q1ZS
            </div>
            <div className="col-4" style={{ textAlign: "center" }}>
              FSSAI: 12119201000010
            </div>
            <div className="col-3" style={{ textAlign: "right" }}>
              Booking No. H-{booking.bookingId}
            </div>
            <div className="col-12" style={{ textAlign: "center" }}>
              <h4>Guest Registration Card</h4>
            </div>
            <div
              className="fontDiv"
              style={{
                width: room.photo ? "6.1in" : "",
                display: "inline-block",
              }}
            >
              <table style={{ width: "100%" }}>
                <tbody>
                  <tr>
                    <th style={{ width: "20%" }}>Guest Name</th>
                    <td
                      style={{ borderBottom: "2px dotted black", width: "38%" }}
                    >
                      {room.name}
                    </td>
                    <th style={{ width: "12%" }}>Company</th>
                    <td
                      style={{ borderBottom: "2px dotted black", width: "30%" }}
                    >
                      {room.company}
                    </td>
                    {/* <td */}
                  </tr>
                </tbody>
              </table>
              <table style={{ width: "100%" }}>
                <tbody>
                  <tr>
                    <th style={{ width: "12%" }}>Address</th>
                    <td
                      style={{ width: "48%", borderBottom: "2px dotted black" }}
                    >
                      {room.address}
                    </td>
                    <th style={{ width: "12%" }}>GSTIN</th>
                    <td
                      style={{ width: "28%", borderBottom: "2px dotted black" }}
                    >
                      {room.GSTIN}
                    </td>
                  </tr>
                </tbody>
              </table>
              <table style={{ width: "100%" }}>
                <tbody>
                  <tr>
                    <th style={{ width: "19%" }}>Date of Birth</th>
                    <td
                      style={{ width: "14%", borderBottom: "2px dotted black" }}
                    >
                      {room.dob ? new Date(room.dob).toLocaleDateString() : ""}
                    </td>
                    <th style={{ width: "28%" }}>Date of Anniversary</th>
                    <td
                      style={{ width: "14%", borderBottom: "2px dotted black" }}
                    >
                      {room.doa
                        ? new Date(room.doa).toLocaleString("en-GB")
                        : ""}
                    </td>
                    <th style={{ width: "12%" }}>Vehicle</th>
                    <td
                      style={{ width: "25%", borderBottom: "2px dotted black" }}
                    >
                      {room.vehicleNumber}
                    </td>
                  </tr>
                </tbody>
              </table>
              <table style={{ width: "100%" }}>
                <tbody>
                  <tr>
                    <th style={{ width: "12%" }}>Mobile</th>
                    <td
                      style={{ width: "21%", borderBottom: "2px dotted black" }}
                    >
                      {room.mobile}
                    </td>
                    <th style={{ width: "12%" }}>Email</th>
                    <td
                      style={{ width: "25%", borderBottom: "2px dotted black" }}
                    >
                      {room.email}
                    </td>
                    <th style={{ width: "12%" }}>Nationality</th>
                    <td
                      style={{ width: "17%", borderBottom: "2px dotted black" }}
                    >
                      {room.nationality}
                    </td>
                  </tr>
                </tbody>
              </table>
              <table style={{ width: "100%" }}>
                <tbody>
                  <tr>
                    <th style={{ width: "7%" }}>Room</th>
                    <td
                      style={{ width: "17%", borderBottom: "2px dotted black" }}
                    >
                      {room.room ? room.room.label : ""}
                    </td>
                    <th style={{ width: "9%" }}>Tarrif</th>
                    <td
                      style={{ width: "12%", borderBottom: "2px dotted black" }}
                    >
                      Rs. {room.roomRate}
                    </td>
                    <th style={{ width: "16%" }}>Booking Date</th>
                    <td
                      style={{ width: "14%", borderBottom: "2px dotted black" }}
                    >
                      {new Date(room.bookingDate).toLocaleDateString()}
                    </td>
                  </tr>
                </tbody>
              </table>
              <table style={{ width: "100%" }}>
                <tbody>
                  <tr>
                    <th style={{ width: "11%" }}>Arrival</th>
                    <td
                      style={{ width: "37%", borderBottom: "2px dotted black" }}
                    >
                      {new Date(room.arrivalTime).toLocaleString()}
                    </td>
                    <th style={{ width: "15%" }}>Checkout</th>
                    <td
                      style={{ width: "37%", borderBottom: "2px dotted black" }}
                    >
                      {new Date(room.checkoutTime).toLocaleString()}
                    </td>
                  </tr>
                </tbody>
              </table>
              <table style={{ width: "100%" }}>
                <tbody>
                  <tr>
                    <th style={{ width: "9%" }}>Males</th>
                    <td
                      style={{ width: "5%", borderBottom: "2px dotted black" }}
                    >
                      {room.male}
                    </td>
                    <th style={{ width: "13%" }}>Females</th>
                    <td
                      style={{ width: "5%", borderBottom: "2px dotted black" }}
                    >
                      {room.female}
                    </td>
                    <th style={{ width: "14%" }}>Children</th>
                    <td
                      style={{ width: "5%", borderBottom: "2px dotted black" }}
                    >
                      {room.children}
                    </td>
                    {room.extraBed ? (
                      <Fragment>
                        <th style={{ width: "16%" }}>Extra Beds</th>
                        <td
                          style={{
                            width: "5%",
                            borderBottom: "2px dotted black",
                          }}
                        >
                          {room.extraBedNumber}
                        </td>
                        <th style={{ width: "1%" }}>@</th>
                        <td
                          style={{
                            width: "30%",
                            borderBottom: "2px dotted black",
                          }}
                        >
                          Rs. {room.extraBedCost} Per Bed
                        </td>
                      </Fragment>
                    ) : null}
                  </tr>
                </tbody>
              </table>
            </div>
            {room.photo ? (
              <div style={{ display: "inline-block ", width: "1.5in" }}>
                <img src={room.photo} style={{}} alt="not found" />
              </div>
            ) : null}
            <div>
              <table style={{ width: "100%" }}>
                <tbody>
                  <tr>
                    <th style={{ width: "7%" }}>Source</th>
                    <td
                      style={{ width: "17%", borderBottom: "2px dotted black" }}
                    >
                      {room.from}
                    </td>
                    <th style={{ width: "9%" }}>Destination</th>
                    <td
                      style={{ width: "17%", borderBottom: "2px dotted black" }}
                    >
                      {room.to}
                    </td>
                    {includes !== "" ? (
                      <Fragment>
                        <th style={{ width: "12%" }}>Includes</th>
                        <td style={{ borderBottom: "2px dotted black" }}>
                          {includes}
                        </td>
                      </Fragment>
                    ) : null}
                  </tr>
                </tbody>
              </table>
              <table style={{ width: "100%" }}>
                <tbody>
                  <th style={{ width: "9%" }}>Passport</th>
                  <td style={{ width: "9%", borderBottom: "2px dotted black" }}>
                    {room.passportNumber}
                  </td>
                  <th style={{ width: "9%" }}>Issued at</th>
                  <td style={{ width: "12%", borderBottom: "2px dotted" }}>
                    {room.passportIssuedAt}
                  </td>
                  <th style={{ width: "4%" }}>On</th>
                  <td style={{ width: "12%", borderBottom: "2px dotted" }}>
                    {room.passportDateOfIssue
                      ? new Date(room.passportDateOfIssue).toLocaleDateString()
                      : ""}
                  </td>
                  <th style={{ width: "9%" }}>Valid Till</th>
                  <td style={{ width: "12%", borderBottom: "2px dotted" }}>
                    {room.passportValidUpto
                      ? new Date(room.passportValidUpto).toLocaleDateString()
                      : ""}
                  </td>
                </tbody>
              </table>
              <table style={{ width: "100%" }}>
                <tbody>
                  <th style={{ width: "7%" }}>Visa</th>
                  <td
                    style={{ width: "11%", borderBottom: "2px dotted black" }}
                  >
                    {room.visaNumber}
                  </td>
                  <th style={{ width: "9%" }}>Issued at</th>
                  <td style={{ width: "12%", borderBottom: "2px dotted" }}>
                    {room.visaIssuedAt}
                  </td>
                  <th style={{ width: "4%" }}>On</th>
                  <td style={{ width: "12%", borderBottom: "2px dotted" }}>
                    {room.visaDateOfIssue
                      ? new Date(room.visaDateOfIssue).toLocaleDateString()
                      : ""}
                  </td>
                  <th style={{ width: "9%" }}>Valid Till</th>
                  <td style={{ width: "12%", borderBottom: "2px dotted" }}>
                    {room.visaValidUpto
                      ? new Date(room.visaValidUpto).toLocaleDateString()
                      : ""}
                  </td>
                </tbody>
              </table>
              <table style={{ width: "40%" }}>
                <tbody>
                  <tr>
                    <th>Arrival in India</th>
                    <td
                      style={{ width: "50%", borderBottom: "2px dotted black" }}
                    >
                      {room.arrivalInIndia
                        ? new Date(room.arrivalInIndia).toLocaleDateString()
                        : ""}
                    </td>
                  </tr>
                </tbody>
              </table>
              <br />
              <br />
              <table style={{ width: "100%" }}>
                <tbody>
                  <tr>
                    <td style={{ width: "33%" }}>Front Office</td>
                    <td style={{ width: "33%", textAlign: "center" }}>
                      Manager
                    </td>
                    <td style={{ width: "33%", textAlign: "right" }}>Guest</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div style={{ alignItems: "center" }}>
              <br />
              <br />
              <img
                src={room.idFront}
                style={{ width: "50%", align: "center" }}
                alt="not found"
              />
              <img
                src={room.idBack}
                style={{ width: "50%", align: "center" }}
                alt="not found"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }
}
