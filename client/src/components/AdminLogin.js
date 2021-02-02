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
      var res = await axios.post("http://192.168.2.2:5001/mall-restraunt/us-central1/api/login/admin", { username: username, password: password });
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
      <div>
        <form onSubmit={(e) => this.onSubmit(e)} className="form-group">
          <h3>Admin Login</h3>
          <div className="form-group">
            <input className="form-control" type="text" name="username" id="username" value={username} onChange={(e) => this.onChange(e)} placeholder="Admin Username" />
          </div>
          <div className="form-group">
            <input className="form-control" type="password" name="password" id="password" value={password} onChange={(e) => this.onChange(e)} placeholder="Password" />
          </div>
          <p style={{ color: "red" }} id="error"></p>
          <div className="form-group">
            <input className="btn btn-primary" type="submit" value="Log in as Admin" />
          </div>
        </form>
      </div>
    );
  }
}
