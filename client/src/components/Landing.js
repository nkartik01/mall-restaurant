import axios from "axios";
import React, { Component, Fragment } from "react";
import AlertDiv from "../AlertDiv";
import AdminLogin from "./AdminLogin";
import OperatorLogin from "./OperatorLogin";

export default class Landing extends Component {
  state = { printers: [], printer: localStorage.getItem("printer") ? localStorage.getItem("printer") : "" };
  getPrinters = async () => {
    var printers = await axios.get("http://"+require("../config.json").ip+":5001/mall-restraunt/us-central1/api/bill/printers", { headers: { "x-auth-token": localStorage.getItem("token") } });
    this.setState({ printers: printers.data.printers });
  };
  componentDidMount() {
    if (localStorage.getItem("status") === "admin") this.getPrinters();
  }
  render() {
    var status = localStorage.getItem("status");
    return (
      <div>
        {!status ? (
          <Fragment>
            <AdminLogin /> <br /> <OperatorLogin />
          </Fragment>
        ) : null}
        {status === "admin" ? (
          <Fragment>
            <h4>Set printer for this browser</h4>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                localStorage.setItem("printer", this.state.printer);
                AlertDiv("green", "Printer set successfully");
              }}
            >
              <select
                value={this.state.printer}
                onChange={(e) => {
                  e.preventDefault();
                  this.setState({ printer: e.target.value });
                }}
              >
                {this.state.printers.map((printer, _) => {
                  return (
                    <option key={printer.name} id={printer.name}>
                      {printer.name}
                    </option>
                  );
                })}
              </select>
              <input type="submit" value="Submit" />
            </form>
          </Fragment>
        ) : null}
        {status === "operator" ? <Fragment></Fragment> : null}
      </div>
    );
  }
}
