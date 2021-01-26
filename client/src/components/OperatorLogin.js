import React, { Component } from "react";
import axios from "axios";
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
      var res = await axios.post("http://192.168.1.178:5001/mall-restraunt/us-central1/api/login/operator", { username: username, password: password });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("status", "operator");
      localStorage.setItem("username", username);
      localStorage.setItem("permissions", res.data.permissions);
      window.open("/#/", "_self");
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
          <div className="form-group">
            <input type="text" name="username" id="username" value={username} onChange={(e) => this.onChange(e)} />
          </div>
          <div className="form-group">
            <input type="password" name="password" id="password" value={password} onChange={(e) => this.onChange(e)} />
          </div>
          <p style={{ color: "red" }} id="error"></p>
          <div className="form-group">
            <input type="submit" value="Submit" />
          </div>
        </form>
      </div>
    );
  }
}
