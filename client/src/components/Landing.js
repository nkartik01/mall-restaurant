import React, { Component, Fragment } from "react";
import { Link } from "react-router-dom";

export default class Landing extends Component {
  render() {
    var status = localStorage.getItem("status");
    return (
      <div>
        {!status ? <Link to="/adminLogin">Admin Login</Link> : null}
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
          </Fragment>
        ) : null}
      </div>
    );
  }
}
