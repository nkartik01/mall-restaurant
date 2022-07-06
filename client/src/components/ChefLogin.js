import React, { Component } from "react";
import axios from "axios";
import { setData } from "../redux/action/loadedData";

export default class ChefLogin extends Component {
  state = { chefUsername: "", password: "" };
  onChange = (e) => {
    e.preventDefault();
    this.setState({ [e.target.name]: e.target.value });
  };
  onSubmit = async (e) => {
    e.preventDefault();
    const { chefUsername, password } = this.state;
    try {
      var res = await axios.post(
        localStorage.getItem("apiUrl") + "login/chef",
        {
          username: chefUsername,
          password: password,
        }
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
      localStorage.setItem("status", "chef");
      localStorage.setItem("username", chefUsername);
      setData({ permissions: res.data.permissions });
      this.setState({});
      window.location.reload();
    } catch (err) {
      console.log(err);
      document.getElementById("chefError").innerHTML = "Invalid Credentials";
    }
  };
  render() {
    const { chefUsername, password } = this.state;
    return (
      <center>
        <div
          className="col-md-3"
          style={{ border: "2px solid black", zIndex: 1 }}
        >
          <form onSubmit={(e) => this.onSubmit(e)}>
            <h3>Chef Login</h3>
            <div className="form-group">
              <input
                className="form-control"
                type="text"
                name="chefUsername"
                id="chefUsername"
                value={chefUsername}
                onChange={(e) => this.onChange(e)}
                placeholder="Chef chefUsername"
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
            <p style={{ color: "red" }} id="chefError"></p>
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
