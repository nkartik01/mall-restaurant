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
            <Link to="/operatorSignup">Add Operator</Link>
          </Fragment>
        ) : null}
      </div>
    );
  }
}
