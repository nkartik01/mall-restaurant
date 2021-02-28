import axios from "axios";
import React, { Component, Fragment } from "react";
import AlertDiv from "../AlertDiv";
import AdminLogin from "./AdminLogin";
import OperatorLogin from "./OperatorLogin";
import Availability from "./Availability";
export default class Landing extends Component {
  state = {
    printers: [],
    printer: localStorage.getItem("printer") ? localStorage.getItem("printer") : "",
    kotPrinter: "",
    disc: true,
    menus: [],
    restaurants: [],
  };
  getPrinters = async () => {
    var printers = await axios.get(require("../config.json").url + "bill/printers", { headers: { "x-auth-token": localStorage.getItem("token") } });
    this.setState({ printers: printers.data.printers });
  };
  getMenus = async () => {
    var menus = await axios.get(require("../config.json").url + "menu/listMenusFromFolder");
    this.setState({ menus: menus.data.menus });
  };
  getRestaurants = async () => {
    var res = await axios.get(require("../config.json").url + "menu/restaurants");
    console.log(res.data);

    this.setState({ restaurants: res.data.restaurants });
  };
  componentDidMount() {
    if (localStorage.getItem("status") === "admin") {
      this.getPrinters();
      this.getMenus();
      this.getRestaurants();
    }
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
            <div className="row">
              <div className="col-md-4">
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
              </div>
              <div className="col-md-4">
                <h4>Add/Update Menu</h4>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    try {
                      axios.post(require("../config.json").url + "menu/setMenu/" + this.state.menu, { kot: this.state.kot, disc: this.state.disc });
                      AlertDiv("green", "Menu Updated");
                    } catch {
                      AlertDiv("red", "Excel Format not correct, Check server console");
                    }
                  }}
                >
                  <select
                    required
                    value={this.state.menu}
                    onChange={(e) => {
                      e.preventDefault();
                      this.setState({ menu: e.target.value });
                    }}
                  >
                    <option value={null}></option>
                    {this.state.menus.map((menu, _) => {
                      return <option value={menu}>{menu}</option>;
                    })}
                  </select>
                  <label>Discount: </label>
                  <select
                    required
                    value={this.state.disc}
                    onChange={(e) => {
                      e.preventDefault();
                      this.setState({ disc: e.target.value === "true" ? true : false });
                    }}
                  >
                    <option value={true}>True</option>
                    <option value={false}>False</option>
                  </select>
                  <label>Printer: </label>
                  <select
                    required
                    value={this.state.kot}
                    onChange={(e) => {
                      e.preventDefault();
                      this.setState({ kot: e.target.value });
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
              </div>
              <div className="col-md-4">
                <h4>Add Restaurant</h4>
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    try {
                      await axios.get(require("../config.json").url + "menu/addRestaurant/" + this.state.restaurantName, {
                        headers: { "x-auth-token": localStorage.getItem("token") },
                      });
                      AlertDiv("green", "Restaurant Added Successfully");
                    } catch {
                      AlertDiv("red", "Couldn't Create Restaurant by that name");
                    }
                  }}
                >
                  <input
                    type="text"
                    required
                    placeholder="Enter Restaurant Name"
                    value={this.state.restaurantName}
                    onChange={(e) => {
                      e.preventDefault();
                      this.setState({ restaurantName: e.target.value });
                    }}
                  />
                  <input type="submit" value="Create" />
                </form>
              </div>
              <div className="col-md-4">
                <h4>Set KOT printer for this browser</h4>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    localStorage.setItem("kotPrinter", this.state.kotPrinter);
                    AlertDiv("green", "Printer set successfully");
                  }}
                >
                  <select
                    value={this.state.kotPrinter}
                    onChange={(e) => {
                      e.preventDefault();
                      this.setState({ kotPrinter: e.target.value });
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
              </div>
            </div>
          </Fragment>
        ) : null}
        {status === "operator" ? (
          <Fragment>
            <Availability />
          </Fragment>
        ) : null}
      </div>
    );
  }
}
