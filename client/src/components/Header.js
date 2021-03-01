import React, { Component, Fragment } from "react";
import { Link } from "react-router-dom";

export default class Header extends Component {
  render() {
    var status = localStorage.getItem("status");
    return (
      <div>
        Urban Food Cafe, CityWalk Mall, Abohar.
        <div style={{ display: "inline-block" }}>
          {status === "admin" ? (
            <Fragment>
              <Link className="btn btn-primary" to="/operatorSignup">
                Add Operator
              </Link>
              <Link className="btn btn-primary" to="/listOperators">
                Operator List
              </Link>
              <Link className="btn btn-primary" to="/registerRFID">
                Register RFID Cards
              </Link>
            </Fragment>
          ) : null}
          {status === "operator" ? (
            <Fragment>
              <Link to="/takeOrder" className="btn btn-primary">
                Take Orders
              </Link>
              <Link to="/manipulateRFID" className="btn btn-primary">
                Manipulate RFID
              </Link>
              <Link to="/billList" className="btn btn-primary">
                Bill List
              </Link>
              <Link to={"/operator/" + localStorage.getItem("username")} className={"btn btn-primary"}>
                Profile
              </Link>
            </Fragment>
          ) : null}
          {!status ? (
            <Fragment></Fragment>
          ) : (
            <Fragment>
              <Link to="/booking" className="btn btn-primary">
                Booking
              </Link>

              <Link to="/availability" className="btn btn-primary">
                Availability
              </Link>
              <Link to={"/report"} className="btn btn-primary">
                Reports
              </Link>
              <button
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
