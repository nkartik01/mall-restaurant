import axios from "axios";
import React, { Component } from "react";
import AlertDiv from "../AlertDiv";

export default class RegisterRFID extends Component {
  state = { uid: "", status: "" };
  onSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        "http://"+require("../config.json").ip+":5001/mall-restraunt/us-central1/api/card/registerCard",
        { uid: this.state.uid },
        { headers: { "x-auth-token": localStorage.getItem("token") } }
      );
      AlertDiv("green", "Registered Successfully");
    } catch (err) {
      console.log(err, err.response.status);
      if (err.response.status === 400) {
        AlertDiv("red", "Already Exists");
      } else {
        AlertDiv("red", "UnIdentified Error");
      }
    }
    this.setState({ uid: "" });
  };
  onChange = (e) => {
    e.preventDefault();
    this.setState({ [e.target.name]: e.target.value });
  };
  render() {
    return (
      <div>
        <form onSubmit={(e) => this.onSubmit(e)}>
          <div className="form-group">
            <input
              //   hidden
              autoFocus
              type="text"
              value={this.state.uid}
              id="uid"
              name="uid"
              onChange={(e) => {
                this.onChange(e);
              }}
              className="form-control"
            />
          </div>
          <p id="status" style={{ backgroundColor: "green", fontWeight: "bold" }}>
            {this.state.status}
          </p>
          <input type="submit" value="Submit" className="btn btn-primary" />
        </form>
      </div>
    );
  }
}
