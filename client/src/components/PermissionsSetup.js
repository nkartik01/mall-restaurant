// import axios from "axios";
import React, { Component } from "react";

export default class PermissionsSetup extends Component {
  state = {
    menus: [],
    edit: false,
    changeMenu: false,
    restaurant: {},
    wait: {},
  };
  // getMenus = async (e) => {
  //   var res = await axios.get("http://192.168.1.178:5001/mall-restraunt/us-central1/api/menu/listMenus");
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
  // componentDidMount() {
  //   this.getMenus();
  // }
  render() {
    // var { menus } = this.state;
    var restraunts = ["counter", "restaurant1", "restaurant2", "bar", "others"];
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
          {restraunts.map((restaurant, i) => {
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
