import axios from "axios";
import React, { Component, Fragment } from "react";
import { Link } from "react-router-dom";

export default class Header extends Component {
  componentDidMount() {
    if (localStorage.getItem("status")) {
      axios
        .get(
          localStorage.getItem("apiUrl") +
            "login/verify/" +
            localStorage.getItem("status"),
          {
            headers: { "x-auth-token": localStorage.getItem("token") },
          }
        )
        .catch((err) => {
          localStorage.removeItem("status");
          localStorage.removeItem("token");
          localStorage.removeItem("username");
          window.open("/", "_self");
        });
    }
  }
  render() {
    var status = localStorage.getItem("status");
    return (
      <div>
        <p style={{ fontSize: "40px" }}>City Walk Mall, Abohar</p>
        <div style={{ display: "inline-block" }}>
          {status === "admin" ? (
            <Fragment>
              <Link className="btn btn-primary navBtn" to="/operatorSignup">
                Add Operator
              </Link>
              <Link className="btn btn-primary navBtn" to="/listOperators">
                Operator List
              </Link>
              <Link className="btn btn-primary navBtn" to="/chefSignup">
                Add Chef
              </Link>
              <Link className="btn btn-primary navBtn" to="/listChef">
                Chef List
              </Link>
              <Link className="btn btn-primary navBtn" to="/registerRFID">
                Register RFID Cards
              </Link>
              <Link to="/booking" className="btn btn-primary navBtn">
                Booking
              </Link>

              <Link to="/availability" className="btn btn-primary navBtn">
                Availability
              </Link>
              <Link to={"/report"} className="btn btn-primary navBtn">
                Reports
              </Link>
            </Fragment>
          ) : null}
          {status === "operator" ? (
            <Fragment>
              <Link to="/takeOrder" className="btn btn-primary navBtn">
                Take Orders
              </Link>
              <Link to="/manipulateRFID" className="btn btn-primary navBtn">
                Manipulate RFID
              </Link>
              <Link to="/billList" className="btn btn-primary navBtn">
                Bill List
              </Link>
              <Link
                to={"/operator/" + localStorage.getItem("username")}
                className={"btn btn-primary navBtn"}
              >
                Profile
              </Link>
              <Link to="/booking" className="btn btn-primary navBtn">
                Booking
              </Link>

              <Link to="/availability" className="btn btn-primary navBtn">
                Availability
              </Link>
              <Link to={"/report"} className="btn btn-primary navBtn">
                Reports
              </Link>
            </Fragment>
          ) : null}
          {status === "chef" ? (
            <Fragment>
              <Link to={"/"} className="btn btn-primary navBtn">
                Orders
              </Link>
              <Link to={"/revert"} className="btn btn-primary navBtn">
                Revert
              </Link>
            </Fragment>
          ) : null}
          {!status ? (
            <Fragment></Fragment>
          ) : (
            <Fragment>
              <button
                className="btn btn-primary navBtn"
                onClick={(e) => {
                  e.preventDefault();
                  localStorage.removeItem("status");
                  localStorage.removeItem("token");
                  localStorage.removeItem("username");
                  window.open("/", "_self");
                }}
              >
                Logout
              </button>
            </Fragment>
          )}
        </div>
      </div>
    );
  }
}
