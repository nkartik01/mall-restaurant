import axios from "axios";
import React, { Component } from "react";

export default class RegisterRFID extends Component {
  state = { uid: "", status: "" };
  onSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        "http://192.168.1.178:5001/mall-restraunt/us-central1/api/card/registerCard",
        { uid: this.state.uid },
        { headers: { "x-auth-token": localStorage.getItem("token") } }
      );
      document.getElementById("status").style.backgroundColor = "green";
      document.getElementById("status").style.color = "black";
      this.setState({ status: "Done", uid: "" });
      setTimeout(() => this.setState({ status: "" }), 2000);
    } catch (err) {
      console.log(err, err.response.status);
      if (err.response.status === 400) {
        document.getElementById("status").style.backgroundColor = "red";
        document.getElementById("status").style.color = "white";
        this.setState({ status: "Already Exists", uid: "" });
        setTimeout(() => this.setState({ status: "" }), 2000);
      } else {
        document.getElementById("status").style.backgroundColor = "red";
        document.getElementById("status").style.color = "white";
        this.setState({ status: "Error", uid: "" });
        setTimeout(() => this.setState({ status: "" }), 2000);
      }
    }
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
