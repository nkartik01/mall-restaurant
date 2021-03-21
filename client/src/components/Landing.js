import axios from "axios";
import React, { Component, Fragment } from "react";
import AlertDiv from "../AlertDiv";
import AdminLogin from "./AdminLogin";
import OperatorLogin from "./OperatorLogin";
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
              <div className="col-md-4 landingDiv">
                <h4>Set printer for this browser</h4>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    localStorage.setItem("printer", this.state.printer);
                    AlertDiv("green", "Printer set successfully");
                  }}
                >
                  <select
                    className="form-control"
                    value={this.state.printer}
                    onChange={(e) => {
                      e.preventDefault();
                      this.setState({ printer: e.target.value });
                    }}
                    required
                    placeholder="Choose Printer for Billing"
                  >
                    <option value={null}></option>
                    {this.state.printers.map((printer, _) => {
                      return (
                        <option className="form-control" key={printer.name} id={printer.name}>
                          {printer.name}
                        </option>
                      );
                    })}
                  </select>
                  <input className="form-control" type="submit" value="Submit" />
                </form>
              </div>
              <div className="col-md-4 landingDiv">
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
                    className="form-control"
                    required
                    value={this.state.menu}
                    onChange={(e) => {
                      e.preventDefault();
                      this.setState({ menu: e.target.value });
                    }}
                  >
                    <option className="form-control" value={null}></option>
                    {this.state.menus.map((menu, _) => {
                      return (
                        <option className="form-control" value={menu}>
                          {menu}
                        </option>
                      );
                    })}
                  </select>
                  <label>Discount: </label>
                  <select
                    className="form-control"
                    required
                    value={this.state.disc}
                    onChange={(e) => {
                      e.preventDefault();
                      this.setState({ disc: e.target.value === "true" ? true : false });
                    }}
                  >
                    <option className="form-control" value={true}>
                      True
                    </option>
                    <option className="form-control" value={false}>
                      False
                    </option>
                  </select>
                  <label>Printer: </label>
                  <select
                    className="form-control"
                    required
                    value={this.state.kot}
                    onChange={(e) => {
                      e.preventDefault();
                      this.setState({ kot: e.target.value });
                    }}
                  >
                    {this.state.printers.map((printer, _) => {
                      return (
                        <option className="form-control" key={printer.name} id={printer.name}>
                          {printer.name}
                        </option>
                      );
                    })}
                  </select>
                  <input className="form-control" type="submit" value="Submit" />
                </form>
              </div>
              <div className="col-md-4 landingDiv">
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
                    className="form-control"
                    type="text"
                    required
                    placeholder="Enter Restaurant Name"
                    value={this.state.restaurantName}
                    onChange={(e) => {
                      e.preventDefault();
                      this.setState({ restaurantName: e.target.value });
                    }}
                  />
                  <input className="form-control" type="submit" value="Create" />
                </form>
              </div>
              <div className="col-md-4 landingDiv">
                <h4>Set KOT printer for this browser</h4>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    localStorage.setItem("kotPrinter", this.state.kotPrinter);
                    AlertDiv("green", "Printer set successfully");
                  }}
                >
                  <select
                    className="form-control"
                    value={this.state.kotPrinter}
                    onChange={(e) => {
                      e.preventDefault();
                      this.setState({ kotPrinter: e.target.value });
                    }}
                  >
                    {this.state.printers.map((printer, _) => {
                      return (
                        <option className="form-control" key={printer.name} id={printer.name}>
                          {printer.name}
                        </option>
                      );
                    })}
                  </select>
                  <input className="form-control" type="submit" value="Submit" />
                </form>
              </div>
              <div className="col-md-4 landingDiv">
                <h5>Add table to restaurant</h5>
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    try {
                      await axios.post(
                        require("../config.json").url + "menu/addTable",
                        { table: this.state.tableName, restaurant: this.state.tableRestaurant },
                        { headers: { "x-auth-token": localStorage.getItem("token") } }
                      );
                      AlertDiv("green", "Table Added");
                    } catch (err) {
                      console.log(err, err.response);
                      AlertDiv("red", err.response.data);
                    }
                  }}
                >
                  <select
                    className="form-control"
                    required
                    onChange={(e) => {
                      e.preventDefault();
                      this.setState({ tableRestaurant: e.target.value });
                    }}
                    value={this.state.tableRestaurant}
                  >
                    <option className="form-control" value={null}></option>
                    {this.state.restaurants.map((restaurant, _) => {
                      return (
                        <option className="form-control" value={restaurant.restaurantId}>
                          {restaurant.restaurantId}
                        </option>
                      );
                    })}
                  </select>
                  <input
                    className="form-control"
                    type="text"
                    onChange={(e) => {
                      e.preventDefault();
                      this.setState({ tableName: e.target.value });
                    }}
                    value={this.state.tableName}
                    id="tableName"
                    name="tableName"
                    placeholder="Table Name"
                  />
                  <input className="form-control" type="submit" value="Add" />
                </form>
              </div>
              <div className="col-md-4 landingDiv">
                <h5>Delete table from restaurant</h5>
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    try {
                      await axios.delete(require("../config.json").url + "menu/table", {
                        headers: { "x-auth-token": localStorage.getItem("token") },
                        data: { table: this.state.tableDeleteName, restaurant: this.state.tableDeleteRestaurant },
                      });
                      AlertDiv("green", "Table Removed");
                    } catch (err) {
                      console.log(err, err.response);
                      AlertDiv("red", err.response.data);
                    }
                  }}
                >
                  <select
                    className="form-control"
                    required
                    onChange={(e) => {
                      e.preventDefault();
                      this.setState({ tableDeleteRestaurant: e.target.value });
                    }}
                    value={this.state.tableDeleteRestaurant}
                  >
                    <option className="form-control" value={null}></option>
                    {this.state.restaurants.map((restaurant, _) => {
                      return (
                        <option className="form-control" value={restaurant.restaurantId}>
                          {restaurant.restaurantId}
                        </option>
                      );
                    })}
                  </select>
                  <input
                    className="form-control"
                    type="text"
                    onChange={(e) => {
                      e.preventDefault();
                      this.setState({ tableDeleteName: e.target.value });
                    }}
                    value={this.state.tableDeleteName}
                    id="tableDeleteName"
                    name="tableDeleteName"
                    placeholder="Table Name"
                  />
                  <input className="form-control" type="submit" value="Remove" />
                </form>
              </div>
              <div className="col-md-4 landingDiv">
                <h5>Toggle Menu in Restaurant</h5>
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    try {
                      var res = await axios.post(
                        require("../config.json").url + "menu/toggleMenu",
                        { restaurant: this.state.menuRestaurant, menu: this.state.addMenu },
                        { headers: { "x-auth-token": localStorage.getItem("token") } }
                      );
                      AlertDiv("green", res.data);
                    } catch (err) {
                      console.log(err, err.response);
                      AlertDiv("red", err.response.data);
                    }
                  }}
                >
                  <select
                    className="form-control"
                    required
                    onChange={(e) => {
                      e.preventDefault();
                      this.setState({ menuRestaurant: e.target.value });
                    }}
                    value={this.state.menuRestaurant}
                  >
                    <option className="form-control" value={null}></option>
                    {this.state.restaurants.map((restaurant) => {
                      return (
                        <option className="form-control" value={restaurant.restaurantId}>
                          {restaurant.restaurantId}
                        </option>
                      );
                    })}
                  </select>
                  <select
                    className="form-control"
                    required
                    onChange={(e) => {
                      e.preventDefault();
                      this.setState({ addMenu: e.target.value });
                    }}
                    value={this.state.addMenu}
                  >
                    <option className="form-control" value={null}></option>
                    {this.state.menus.map((menu) => {
                      return (
                        <option className="form-control" value={menu}>
                          {menu}
                        </option>
                      );
                    })}
                  </select>
                  <input className="form-control" type="submit" value="Toggle" />
                </form>
              </div>
              <div className="col-md-4 landingDiv">
                <h4>Add Room/Hall For Booking</h4>
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    try {
                      await axios.post(
                        require("../config.json").url + "booking/addRoom",
                        { room: this.state.addRoomName },
                        {
                          headers: { "x-auth-token": localStorage.getItem("token") },
                        }
                      );
                      AlertDiv("green", "Room Added");
                    } catch (err) {
                      console.log(err, err.response);
                      AlertDiv("red", err.response.data);
                    }
                  }}
                >
                  <input
                    className="form-control"
                    type="text"
                    required
                    placeholder="Enter Restaurant Name"
                    value={this.state.addRoomName}
                    onChange={(e) => {
                      e.preventDefault();
                      this.setState({ addRoomName: e.target.value });
                    }}
                  />
                  <input className="form-control" type="submit" value="Add" />
                </form>
              </div>
              <div className="col-md-4 landingDiv">
                <h4>Remove Room/Hall from booking system</h4>
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    try {
                      await axios.delete(require("../config.json").url + "booking/deleteRoom", {
                        data: { room: this.state.removeRoomName },

                        headers: { "x-auth-token": localStorage.getItem("token") },
                      });
                      AlertDiv("green", "Room Removed Successfully");
                    } catch (err) {
                      AlertDiv("red", err.response.data);
                    }
                  }}
                >
                  <input
                    className="form-control"
                    type="text"
                    required
                    placeholder="Enter Room Name"
                    value={this.state.removeRoomName}
                    onChange={(e) => {
                      e.preventDefault();
                      this.setState({ removeRoomName: e.target.value });
                    }}
                  />
                  <input className="form-control" type="submit" value="Remove" />
                </form>
              </div>
            </div>
          </Fragment>
        ) : null}
        {status === "operator" ? <Fragment></Fragment> : null}
      </div>
    );
  }
}
