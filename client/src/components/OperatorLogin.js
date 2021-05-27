import React, { Component } from "react";
import axios from "axios";
import { setData } from "../redux/action/loadedData";

export default class OperatorLogin extends Component {
  state = { operatorUsername: "", password: "" };
  onChange = (e) => {
    e.preventDefault();
    this.setState({ [e.target.name]: e.target.value });
  };
  onSubmit = async (e) => {
    e.preventDefault();
    const { operatorUsername, password } = this.state;
    try {
      var res = await axios.post(
        require("../config.json").url + "login/operator",
        { username: operatorUsername, password: password }
      );
      if (res.data.warn) {
        console.log(res.data.warn);
        console.log(Date.now());
        if (res.data.warn > Date.now())
          alert(
            "Your software is licensed till " +
              new Date(res.data.warn).toDateString("dd/mmmm/yyyy")
          );
        else {
          return alert("Your software licence has expired.");
        }
      }
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("status", "operator");
      localStorage.setItem("operatorUsername", operatorUsername);
      setData({ permissions: res.data.permissions });
      this.setState({});
      window.location.reload();
    } catch (err) {
      console.log(err);
      document.getElementById("operatorError").innerHTML =
        "Invalid Credentials";
    }
  };
  render() {
    const { operatorUsername, password } = this.state;
    return (
      <center>
        <div className="col-md-3" style={{ border: "2px solid black" }}>
          <form onSubmit={(e) => this.onSubmit(e)}>
            <h3>Operator Login</h3>
            <div className="form-group">
              <input
                className="form-control"
                type="text"
                name="operatorUsername"
                id="operatorUsername"
                value={operatorUsername}
                onChange={(e) => this.onChange(e)}
                placeholder="Operator Username"
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
            <p style={{ color: "red" }} id="operatorError"></p>
            <div className="form-group">
              <input
                className="btn btn-primary"
                type="submit"
                value="Log in as operator"
              />
            </div>
          </form>
        </div>
        <br />
      </center>
    );
  }
}
