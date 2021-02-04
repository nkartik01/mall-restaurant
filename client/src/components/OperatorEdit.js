import axios from "axios";
import React, { Component, Fragment } from "react";
import PermissionsSetup from "./PermissionsSetup";

export default class OperatorEdit extends Component {
  state = {
    username: "",
    name: "",
    restaurant: {},
    wait: {},
    edit: false,
    changeMenu: false,
  };
  getOperator = async (e) => {
    var res = await axios.get("http://"+require("../config.json").ip+":5001/mall-restraunt/us-central1/api/operator/getOperator/" + this.props.match.params.username, {
      headers: { "x-auth-token": localStorage.getItem("token") },
    });
    res = res.data;
    this.setState({
      username: res.username,
      name: res.name,
      restaurant: res.permissions.restaurant,
      wait: res.permissions.wait,
      edit: res.permissions.edit,
      changeMenu: res.permissions.changeMenu,
    });
    console.log(this.state);
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
    try {
      var { name, username, restaurant, wait, edit, changeMenu } = this.state;
      var data = {
        name,
        username,
        permissions: { restaurant, wait, edit, changeMenu },
      };
      await axios.post("http://"+require("../config.json").ip+":5001/mall-restraunt/us-central1/api/operator/edit", data, { headers: { "x-auth-token": localStorage.getItem("token") } });
      alert("Operator edited successfully");
    } catch (err) {
      alert("some error occured");
    }
  };
  componentDidMount() {
    this.getOperator();
  }
  render() {
    return (
      <Fragment>
        <div className="col-md-12" style={{ textAlign: "center" }}>
          <form className="form-control" onSubmit={(e) => this.onSubmit(e)}>
            <div className="from-group">
              <input className="form-control" placeholder="Name" type="text" id="name" name="name" value={this.state.name} onChange={(e) => this.onChange(e)} />
            </div>
            <div className="from-group">
              <input className="form-control" placeholder="Username" type="text" id="username" name="username" value={this.state.username} onChange={(e) => this.onChange(e)} />
            </div>
            <PermissionsSetup restaurant={this.state.restaurant} wait={this.state.wait} edit={this.state.edit} changeMenu={this.state.changeMenu} setState1={this.setState1} />
            <input type="Submit" value="Submit" className="form-control btn-primary" />
          </form>
        </div>
      </Fragment>
    );
  }
}
