import axios from "axios";
import React, { Component, Fragment } from "react";
import AlertDiv from "../AlertDiv";
import AdminLogin from "./AdminLogin";
import ChefLogin from "./ChefLogin";
import ChefScreen from "./ChefScreen";
import OperatorLogin from "./OperatorLogin";
export default class Landing extends Component {
  state = {
    printers: [],
    printer: localStorage.getItem("printer")
      ? localStorage.getItem("printer")
      : "",
    kotPrinter: "",
    disc: true,
    menus: [],
    restaurants: [],
  };
  getPrinters = async () => {
    var printers = await axios.get(
      localStorage.getItem("apiUrl") + "bill/printers",
      {
        headers: { "x-auth-token": localStorage.getItem("token") },
      }
    );
    this.setState({ printers: printers.data.printers });
  };
  getMenus = async () => {
    var menus = await axios.get(
      localStorage.getItem("apiUrl") + "menu/listMenusFromFolder"
    );
    this.setState({ menus: menus.data.menus });
  };
  getRestaurants = async () => {
    var res = await axios.get(
      localStorage.getItem("apiUrl") + "menu/restaurants"
    );
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
            <AdminLogin /> <br /> <OperatorLogin /> <br /> <ChefLogin />
          </Fragment>
        ) : null}
        {status === "admin" ? (
          <Fragment>
            <div className="row">
              <div className="col-md-4 landingDiv">
                <h4>Set printer for this browser(For bills and Order Slip)</h4>
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
                        <option
                          className="form-control"
                          key={printer.name}
                          id={printer.name}
                        >
                          {printer.name}
                        </option>
                      );
                    })}
                  </select>
                  <input
                    className="form-control"
                    type="submit"
                    value="Submit"
                  />
                </form>
              </div>
              <div className="col-md-4 landingDiv">
                <h4>Print Order Slip?</h4>
                <p>
                  Currently{" "}
                  {localStorage.getItem("printOrderSlip") !== "false"
                    ? ""
                    : "not"}{" "}
                  Printing
                </p>
                <button
                  className="btn btn-primary"
                  onClick={(e) => {
                    e.preventDefault();
                    if (localStorage.getItem("printOrderSlip") !== "false") {
                      localStorage.setItem("printOrderSlip", "false");
                    } else {
                      localStorage.setItem("printOrderSlip", "true");
                    }
                    this.setState({});
                  }}
                >
                  {localStorage.getItem("printOrderSlip") !== "false"
                    ? "No"
                    : "Yes"}
                </button>
              </div>
              <div className="col-md-4 landingDiv">
                <h4>Print KOTs for orders from this PC?</h4>
                <p>
                  Currently{" "}
                  {localStorage.getItem("printKOT") !== "false" ? "" : "not"}{" "}
                  Printing
                </p>
                <button
                  className="btn btn-primary"
                  onClick={(e) => {
                    e.preventDefault();
                    if (localStorage.getItem("printKOT") !== "false") {
                      localStorage.setItem("printKOT", "false");
                    } else {
                      localStorage.setItem("printKOT", "true");
                    }
                    this.setState({});
                  }}
                >
                  {localStorage.getItem("printKOT") !== "false" ? "No" : "Yes"}
                </button>
              </div>
              <div className="col-md-4 landingDiv">
                <h4>Print one order slip or Different for all menus?</h4>
                <p>
                  Currently Printing{" "}
                  {localStorage.getItem("oneOrderSlip") !== "true"
                    ? "different"
                    : "one"}{" "}
                </p>
                <button
                  className="btn btn-primary"
                  onClick={(e) => {
                    e.preventDefault();
                    if (localStorage.getItem("oneOrderSlip") === "true") {
                      localStorage.setItem("oneOrderSlip", "false");
                    } else {
                      localStorage.setItem("oneOrderSlip", "true");
                    }
                    this.setState({});
                  }}
                >
                  {localStorage.getItem("oneOrderSlip") !== "true"
                    ? "One"
                    : "Different"}
                </button>
              </div>
              <div className="col-md-4 landingDiv">
                <h4>Add/Update Menu</h4>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    try {
                      axios.post(
                        localStorage.getItem("apiUrl") +
                          "menu/setMenu/" +
                          this.state.menu,
                        {
                          kot: this.state.kot,
                          disc: this.state.disc,
                          counterName: this.state.counterName,
                        }
                      );
                      AlertDiv("green", "Menu Updated");
                    } catch {
                      AlertDiv(
                        "red",
                        "Excel Format not correct, Check server console"
                      );
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
                  <label>Counter Name: </label>
                  <input
                    type="text"
                    className="form-control"
                    required
                    value={this.state.counterName}
                    onChange={(e) => {
                      e.preventDefault();
                      this.setState({ counterName: e.target.value });
                    }}
                  />
                  <br />
                  <label>Discount: </label>
                  <select
                    className="form-control"
                    required
                    value={this.state.disc}
                    onChange={(e) => {
                      e.preventDefault();
                      this.setState({
                        disc: e.target.value === "true" ? true : false,
                      });
                    }}
                  >
                    <option className="form-control" value={true}>
                      True
                    </option>
                    <option className="form-control" value={false}>
                      False
                    </option>
                  </select>
                  <label>Printer for KOT: </label>
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
                        <option
                          className="form-control"
                          key={printer.name}
                          id={printer.name}
                        >
                          {printer.name}
                        </option>
                      );
                    })}
                  </select>
                  <input
                    className="form-control"
                    type="submit"
                    value="Submit"
                  />
                </form>
              </div>
              <div className="col-md-4 landingDiv">
                <h4>Add Restaurant</h4>
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    try {
                      await axios.get(
                        localStorage.getItem("apiUrl") +
                          "menu/addRestaurant/" +
                          this.state.restaurantName,
                        {
                          headers: {
                            "x-auth-token": localStorage.getItem("token"),
                          },
                        }
                      );
                      AlertDiv("green", "Restaurant Added Successfully");
                    } catch {
                      AlertDiv(
                        "red",
                        "Couldn't Create Restaurant by that name"
                      );
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
                  <input
                    className="form-control"
                    type="submit"
                    value="Create"
                  />
                </form>
              </div>
              {/* <div className="col-md-4 landingDiv">
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
              </div> */}
              <div className="col-md-4 landingDiv">
                <h5>Add table to Restaurant</h5>
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    try {
                      console.log(this.state.tableRestaurant);
                      if (
                        !this.state.tableRestaurant ||
                        this.state.tableRestaurant === "Select Restaurant"
                      )
                        return;
                      await axios.post(
                        localStorage.getItem("apiUrl") + "menu/addTable",
                        {
                          table: this.state.tableName,
                          restaurant: this.state.tableRestaurant,
                        },
                        {
                          headers: {
                            "x-auth-token": localStorage.getItem("token"),
                          },
                        }
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
                    <option className="form-control" value={null}>
                      Select Restaurant
                    </option>
                    {this.state.restaurants.map((restaurant, _) => {
                      return (
                        <option
                          className="form-control"
                          value={restaurant.restaurantId}
                        >
                          {restaurant.restaurantId}
                        </option>
                      );
                    })}
                  </select>
                  <input
                    className="form-control"
                    type="text"
                    required
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
                <h5>Delete table from Restaurant</h5>
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    try {
                      if (
                        !this.state.tableDeleteRestaurant ||
                        this.state.tableDeleteRestaurant === "Select Restaurant"
                      )
                        return;

                      await axios.delete(
                        localStorage.getItem("apiUrl") + "menu/table",
                        {
                          headers: {
                            "x-auth-token": localStorage.getItem("token"),
                          },
                          data: {
                            table: this.state.tableDeleteName,
                            restaurant: this.state.tableDeleteRestaurant,
                          },
                        }
                      );
                      AlertDiv("green", "Table Removed");
                    } catch (err) {
                      console.log(err, err.response);
                      AlertDiv("red", err.response.data);
                    }
                  }}
                >
                  <select
                    placeholder="Select Restaurant"
                    className="form-control"
                    required
                    onChange={(e) => {
                      e.preventDefault();
                      this.setState({ tableDeleteRestaurant: e.target.value });
                    }}
                    value={this.state.tableDeleteRestaurant}
                  >
                    <option className="form-control" value={null}>
                      Select Restaurant
                    </option>
                    {this.state.restaurants.map((restaurant, _) => {
                      return (
                        <option
                          className="form-control"
                          value={restaurant.restaurantId}
                        >
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
                    required
                    name="tableDeleteName"
                    placeholder="Table Name"
                  />
                  <input
                    className="form-control"
                    type="submit"
                    value="Remove"
                  />
                </form>
              </div>
              <div className="col-md-4 landingDiv">
                <h5>Toggle Menu in Restaurant</h5>
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    try {
                      if (
                        !this.state.menuRestaurant ||
                        this.state.menuRestaurant === "Select Restaurant"
                      )
                        return;
                      if (
                        !this.state.addMenu ||
                        this.state.addMenu === "Select Menu"
                      )
                        return;
                      var res = await axios.post(
                        localStorage.getItem("apiUrl") + "menu/toggleMenu",
                        {
                          restaurant: this.state.menuRestaurant,
                          menu: this.state.addMenu,
                        },
                        {
                          headers: {
                            "x-auth-token": localStorage.getItem("token"),
                          },
                        }
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
                    <option className="form-control" value={null}>
                      Select Restaurant
                    </option>
                    {this.state.restaurants.map((restaurant) => {
                      return (
                        <option
                          className="form-control"
                          value={restaurant.restaurantId}
                        >
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
                    <option className="form-control" value={null}>
                      Select Menu
                    </option>
                    {this.state.menus.map((menu) => {
                      return (
                        <option className="form-control" value={menu}>
                          {menu}
                        </option>
                      );
                    })}
                  </select>
                  <input
                    className="form-control"
                    type="submit"
                    value="Toggle"
                  />
                </form>
              </div>
              <div className="col-md-4 landingDiv">
                <h4>Add Room/Hall For Booking</h4>
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    try {
                      await axios.post(
                        localStorage.getItem("apiUrl") + "booking/addRoom",
                        { room: this.state.addRoomName },
                        {
                          headers: {
                            "x-auth-token": localStorage.getItem("token"),
                          },
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
                      await axios.delete(
                        localStorage.getItem("apiUrl") + "booking/deleteRoom",
                        {
                          data: { room: this.state.removeRoomName },

                          headers: {
                            "x-auth-token": localStorage.getItem("token"),
                          },
                        }
                      );
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
                  <input
                    className="form-control"
                    type="submit"
                    value="Remove"
                  />
                </form>
              </div>
              <div className="col-md-4 landingDiv">
                <h3>Take Backup</h3>
                <form
                  className="form-control"
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if (this.state.backupPassword !== "admin123") {
                      return alert("Incorrect Password");
                    }
                    try {
                      var res = await axios.get(
                        localStorage.getItem("apiUrl") + "report/backup",
                        {
                          headers: {
                            "x-auth-token": localStorage.getItem("token"),
                          },
                        }
                      );
                      AlertDiv("green", res.data);
                    } catch (err) {
                      console.log(err);
                      AlertDiv("red", "Backup Failed");
                    }
                  }}
                >
                  <input
                    className="form-control"
                    type="password"
                    value={this.state.backupPassword}
                    onChange={(e) => {
                      e.preventDefault();
                      this.setState({ backupPassword: e.target.value });
                    }}
                    required
                    placeholder="Password"
                  />
                  <input
                    type="submit"
                    value="Take Backup"
                    className="btn btn-primary"
                  />
                </form>
              </div>
              <div className="col-md-4 landingDiv">
                <h3>Restore Database</h3>
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    var confirm = window.confirm(
                      "Are you sure you want to restore the database from given folder? Any existing data in database will be permanently lost."
                    );
                    if (!confirm) return;

                    if (this.state.restorePassword !== "admin123") {
                      return alert("Incorrect Password");
                    }
                    try {
                      await axios.get(
                        localStorage.getItem("apiUrl") +
                          "report/restore/" +
                          this.state.restoreFolder,
                        {
                          headers: {
                            "x-auth-token": localStorage.getItem("token"),
                          },
                        }
                      );
                      AlertDiv("green", "Restored");
                    } catch (e) {
                      console.log(e, e.response);
                      AlertDiv("red", "Restore Failed");
                    }
                  }}
                >
                  <input
                    type="text"
                    placeholder="Enter Folder name"
                    className="form-control"
                    value={this.state.restoreFolder}
                    onChange={(e) => {
                      e.preventDefault();
                      this.setState({ restoreFolder: e.target.value });
                    }}
                    id="restoreFolder"
                    name="restoreFolder"
                    required
                  />
                  <input
                    type="password"
                    required
                    className="form-control"
                    id="restorePassword"
                    name="restorePassword"
                    value={this.state.restorePassword}
                    onChange={(e) => {
                      e.preventDefault();
                      this.setState({ restorePassword: e.target.value });
                    }}
                    placeholder="Password"
                  />
                  <input
                    type="submit"
                    value="Restore"
                    className="btn btn-primary"
                  />
                </form>
              </div>
              <div className="col-md-4 landingDiv">
                <h3>Delete Restaurant Records</h3>
                <form
                  className="form-control"
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if (this.state.restaurantDeletePassword !== "admin123") {
                      return alert("Incorrect Password");
                    }
                    try {
                      await axios.post(
                        localStorage.getItem("apiUrl") + "report/clearDatabase",
                        {
                          start: new Date(
                            this.state.restaurantDeleteStart
                          ).valueOf(),
                          end: new Date(
                            this.state.restaurantDeleteEnd
                          ).valueOf(),
                        },
                        {
                          headers: {
                            "x-auth-token": localStorage.getItem("token"),
                          },
                        }
                      );
                    } catch (err) {
                      console.log(err, err.response);
                      AlertDiv("red", "Delete Failed");
                    }
                  }}
                >
                  <input
                    className="form-control"
                    type="date"
                    value={this.state.restaurantDeleteStart}
                    onChange={(e) => {
                      e.preventDefault();
                      this.setState({ restaurantDeleteStart: e.target.value });
                    }}
                  />

                  <input
                    className="form-control"
                    type="date"
                    value={this.state.restaurantDeleteEnd}
                    onChange={(e) => {
                      e.preventDefault();
                      this.setState({ restaurantDeleteEnd: e.target.value });
                    }}
                  />
                  <input
                    type="password"
                    required
                    className="form-control"
                    id="restaurantDeletePassword"
                    name="restaurantDeletePassword"
                    value={this.state.restaurantDeletePassword}
                    onChange={(e) => {
                      e.preventDefault();
                      this.setState({
                        restaurantDeletePassword: e.target.value,
                      });
                    }}
                    placeholder="Password"
                  />
                  <input
                    type="submit"
                    value="Delete"
                    className="form-control"
                  />
                </form>
              </div>
            </div>
          </Fragment>
        ) : null}
        {status === "operator" ? (
          <Fragment></Fragment>
        ) : (
          <Fragment>{status === "chef" ? <ChefScreen /> : null}</Fragment>
        )}
      </div>
    );
  }
}
