import React, { Component } from "react";
import axios from "axios";
import { setData } from "../redux/action/loadedData";

export default class OperatorLogin extends Component {
  state = { username: "", password: "" };
  onChange = (e) => {
    e.preventDefault();
    this.setState({ [e.target.name]: e.target.value });
  };
  onSubmit = async (e) => {
    e.preventDefault();
    const { username, password } = this.state;
    try {
      var res = await axios.post(require("../config.json").url + "login/operator", { username: username, password: password });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("status", "operator");
      localStorage.setItem("username", username);
      setData({ permissions: res.data.permissions });
      this.setState({});
      window.location.reload();
    } catch (err) {
      console.log(err);
      document.getElementById("error").innerHTML = "Invalid Credentials";
    }
  };
  render() {
    const { username, password } = this.state;
    return (
      <div>
        <form onSubmit={(e) => this.onSubmit(e)}>
          <h3>Operator Login</h3>
          <div className="form-group">
            <input className="form-control" type="text" name="username" id="username" value={username} onChange={(e) => this.onChange(e)} placeholder="Operator Username" />
          </div>
          <div className="form-group">
            <input className="form-control" type="password" name="password" id="password" value={password} onChange={(e) => this.onChange(e)} placeholder="Password" />
          </div>
          <p style={{ color: "red" }} id="error"></p>
          <div className="form-group">
            <input className="btn btn-primary" type="submit" value="Log in as operator" />
          </div>
        </form>
      </div>
    );
  }
}
