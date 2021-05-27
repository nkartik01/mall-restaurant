import React, { Component } from "react";
import axios from "axios";
export default class AdminLogin extends Component {
  state = { username: "", password: "" };
  onChange = (e) => {
    e.preventDefault();
    this.setState({ [e.target.name]: e.target.value });
  };
  onSubmit = async (e) => {
    e.preventDefault();
    const { username, password } = this.state;
    try {
      var res = await axios.post(
        require("../config.json").url + "login/admin",
        { username: username, password: password }
      );
      if (res.data.warn) {
        console.log(res.data.warn);
        console.log(Date.now());
        if (res.data.warn > Date.now())
          alert(
            "Your software is licensed till " +
              new Date(res.data.warn).toLocaleDateString()
          );
        else {
          return alert("Your software licence has expired.");
        }
      }
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("status", "admin");
      localStorage.setItem("username", username);
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
          <form onSubmit={(e) => this.onSubmit(e)} className="form-group">
            <h3>Admin Login</h3>
            <div className="form-group">
              <input
                className="form-control"
                type="text"
                name="username"
                id="username"
                value={username}
                onChange={(e) => this.onChange(e)}
                placeholder="Admin Username"
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
                value="Log in as Admin"
              />
            </div>
          </form>
        </div>
        <br />
      </center>
    );
  }
}
