// import axios from "axios";
import axios from "axios";
import React, { Component } from "react";

export default class PermissionsSetup extends Component {
  state = {
    menus: [],
    edit: false,
    changeMenu: false,
    wait: {},
  };
  // getMenus = async (e) => {
  //   var res = await axios.get(require("../config.json").url+"menu/listMenus");
  //   res = res.data;
  //   this.setState({ menus: res.menus });
  // };
  onChange = (e) => {
    var array = e.target.id.split("-");
    console.log(e.target.checked);
    var x = this.props[array[0]];
    x[array[1].split(".")[0]] = e.target.checked ? true : undefined;
    this.props.setState1([array[0], x]);
    console.log(this.state);
  };
  getMenus = async () => {
    var res = await axios.get(require("../config.json").url + "menu/listMenus");
    res = res.data;
    this.setState({ menus: res.menus });
  };
  componentDidMount() {
    this.getMenus();
  }
  render() {
    // var { menus } = this.state;
    var menus = this.state.menus;
    //  [
    //   "Urban Food Court",
    //   "Perry Club",
    //   "Pizzaria",
    //   "Juice Bar",
    //   "Dosa Counter",
    //   "Umega Hotel",
    // ];
    return (
      <div align="left">
        {/* <div>
          <label>Recieve orders from: </label>
          <br />
          {menus.map((elem, i) => {
            return (
              <div key={"menu-" + elem} className="form-group">
                <input
                  checked={this.props.menu[elem]}
                  className="form-check-input position-static"
                  type="checkbox"
                  name={"menu-" + elem}
                  id={"menu-" + elem}
                  onChange={(e) => this.onChange(e)}
                />
                <label htmlFor={"menu-" + elem}>{elem}</label>
              </div>
            );
          })}
        </div> */}
        <div>
          <label>Recieve orders in: </label>
          <br />
          {menus.map((menu, i) => {
            console.log(menu);
            return (
              <div className="form-group" key={"wait" + i}>
                <input
                  checked={this.props.wait[menu.split(".")[0]]}
                  className="form-check-input position-static"
                  type="checkbox"
                  name={"wait-" + menu}
                  id={"wait-" + menu}
                  onChange={(e) => this.onChange(e)}
                />
                <label htmlFor={"wait-" + menu}>{menu}</label>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
}
