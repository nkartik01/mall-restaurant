import axios from "axios";
import React, { Component, Fragment } from "react";
import PermissionsSetup from "./PermissionsSetup";

export default class OperatorSignup extends Component {
  state = {
    username: "",
    password: "",
    name: "",
    restaurant: {},
    wait: {},
    edit: false,
    changeMenu: false,
  };
  setState1 = (arr) => {
    this.setState({ [arr[0]]: arr[1] });
  };
  onChange = (e) => {
    e.preventDefault();
    this.setState({ [e.target.name]: e.target.value });
  };
  onSubmit = async (e) => {
    e.preventDefault();
    var { name, username, password, restaurant, wait, edit, changeMenu } = this.state;
    var data = {
      name,
      username,
      password,
      permissions: { restaurant, wait, edit, changeMenu },
    };
    try {
      await axios.post("http://192.168.1.178:5001/mall-restraunt/us-central1/api/signup/operator", data, { headers: { "x-auth-token": localStorage.getItem("token") } });
      alert("Operator Created Successfully");
    } catch (err) {
      console.log(err);
      alert("Some error occured");
    }
  };
  render() {
    return (
      <Fragment>
        <div className="col-md-12" style={{ textAlign: "center" }}>
          <form className="form-control" onSubmit={(e) => this.onSubmit(e)}>
            <div className="from-group">
              <input required className="form-control" placeholder="Name" type="text" id="name" name="name" value={this.state.name} onChange={(e) => this.onChange(e)} />
            </div>
            <div className="from-group">
              <input
                required
                className="form-control"
                placeholder="Username"
                type="text"
                id="username"
                name="username"
                value={this.state.username}
                onChange={(e) => this.onChange(e)}
              />
            </div>
            <div className="from-group">
              <input
                required
                className="form-control"
                placeholder="password"
                type="password"
                id="password"
                name="password"
                value={this.state.password}
                onChange={(e) => this.onChange(e)}
              />
            </div>
            <PermissionsSetup restaurant={this.state.restaurant} wait={this.state.wait} edit={this.state.edit} changeMenu={this.state.changeMenu} setState1={this.setState1} />
            <input type="Submit" value="Submit" className="form-control btn-primary" />
          </form>
        </div>
      </Fragment>
    );
  }
}
