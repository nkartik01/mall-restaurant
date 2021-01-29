import React, { Component, Fragment } from "react";
import { Link } from "react-router-dom";

export default class Header extends Component {
  render() {
    var status = localStorage.getItem("status");
    return (
      <div>
        This is my header. Urban Food Cafe, CityWalk Mall, Abohar.
        <div style={{ display: "inline-block" }}>
          {!status ? <Fragment></Fragment> : null}
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
            </Fragment>
          ) : null}
        </div>
      </div>
    );
  }
}
