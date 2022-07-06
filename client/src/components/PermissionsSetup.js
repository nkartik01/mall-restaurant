// import axios from "axios";
import axios from "axios";
import React, { Component } from "react";

export default class PermissionsSetup extends Component {
  state = {
    menus: [],
    edit: false,
    changeMenu: false,
    restaurants: [],
    wait: {},
  };
  // getMenus = async (e) => {
  //   var res = await axios.get(localStorage.getItem("apiUrl")+"menu/listMenus");
  //   res = res.data;
  //   this.setState({ menus: res.menus });
  // };
  onChange = (e) => {
    var array = e.target.id.split("-");
    console.log(e.target.checked);
    var x = this.props[array[0]];
    x[array[1]] = e.target.checked ? true : undefined;
    this.props.setState1([array[0], x]);
    console.log(this.state);
  };
  getRestaurants = async () => {
    var res = await axios.get(
      localStorage.getItem("apiUrl") + "menu/restaurants"
    );
    res = res.data;
    this.setState({ restaurants: res.restaurants });
  };
  componentDidMount() {
    this.getRestaurants();
  }
  render() {
    // var { menus } = this.state;
    var restaurants = this.state.restaurants;
    return (
      <div align="left">
        {/* <div>
          <label>Recieve orders from: </label>
          <br />
          {menus.map((elem, i) => {
            return (
              <div key={"restaurant-" + elem} className="form-group">
                <input
                  checked={this.props.restaurant[elem]}
                  className="form-check-input position-static"
                  type="checkbox"
                  name={"restaurant-" + elem}
                  id={"restaurant-" + elem}
                  onChange={(e) => this.onChange(e)}
                />
                <label htmlFor={"restaurant-" + elem}>{elem}</label>
              </div>
            );
          })}
        </div> */}
        <div>
          <label>Recieve orders in: </label>
          <br />
          {restaurants.map((restaurant, i) => {
            restaurant = restaurant.id;
            return (
              <div className="form-group" key={"wait" + i}>
                <input
                  checked={this.props.wait[restaurant]}
                  className="form-check-input position-static"
                  type="checkbox"
                  name={"wait-" + restaurant}
                  id={"wait-" + restaurant}
                  onChange={(e) => this.onChange(e)}
                />
                <label htmlFor={"wait-" + restaurant}>{restaurant}</label>
              </div>
            );
          })}
        </div>
        <label>Access permissions:</label>
        <div className="form-group">
          <input
            checked={this.props.edit}
            className="form-check-input position-static"
            type="checkbox"
            name="edit"
            id="edit"
            onChange={(e) => {
              this.props.setState1([e.target.id, e.target.checked]);
            }}
          />
          <label htmlFor="edit">Edit orders</label>
        </div>
        <div className="form-group">
          <input
            checked={this.props.changeMenu}
            className="form-check-input position-static"
            type="checkbox"
            name="changeMenu"
            id="changeMenu"
            onChange={(e) => {
              this.props.setState1([e.target.id, e.target.checked]);
            }}
          />
          <label htmlFor="edit">Change Restaurant Menus</label>
        </div>
      </div>
    );
  }
}
