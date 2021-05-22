import React, { Component } from "react";
import axios from "axios";
import { setData } from "../redux/action/loadedData";

export default class ChefLogin extends Component {
  state = { username: "", password: "" };
  onChange = (e) => {
    e.preventDefault();
    this.setState({ [e.target.name]: e.target.value });
  };
  onSubmit = async (e) => {
    e.preventDefault();
    const { username, password } = this.state;
    try {
      var res = await axios.post(require("../config.json").url + "login/chef", {
        username: username,
        password: password,
      });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("status", "chef");
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
      <center>
        <div className="col-md-3" style={{ border: "2px solid black" }}>
          <form onSubmit={(e) => this.onSubmit(e)}>
            <h3>Chef Login</h3>
            <div className="form-group">
              <input
                className="form-control"
                type="text"
                name="username"
                id="username"
                value={username}
                onChange={(e) => this.onChange(e)}
                placeholder="Chef Username"
              />
            </div>
            <div className="form-group">
              <input
                className="form-control"
                type="password"
                name="password"
                id="password"
                value={password}
                onChange={(e) => this.onChange(e)}
                placeholder="Password"
              />
            </div>
            <p style={{ color: "red" }} id="error"></p>
            <div className="form-group">
              <input
                className="btn btn-primary"
                type="submit"
                value="Log in as chef"
              />
            </div>
          </form>
        </div>
        <br />
      </center>
    );
  }
}
