import axios from "axios";
import React, { Component, Fragment } from "react";

export default class ManipulateRFID extends Component {
  state = { uid: "", card: {} };
  getCard = async (e) => {
    try {
      e.preventDefault();
      var res = await axios.get("http://192.168.1.178:5001/mall-restraunt/us-central1/api/card/getCard/" + this.state.uid, {
        headers: { "x-auth-token": localStorage.getItem("token") },
      });
      res = res.data;
      this.setState({ card: res.card });
    } catch (err) {
      console.log(err, err.response);
    }
  };
  onChange = (e) => {
    e.preventDefault();
    this.setState({ [e.target.id]: e.target.value });
  };
  render() {
    return (
      <div>
        {Object.keys(this.state.card).length === 0 ? (
          <form onSubmit={(e) => this.getCard(e)}>
            <div className="form-group">
              <input autoFocus type="text" required name={"uid"} placeholder="uid" id="uid" value={this.state.uid} onChange={(e) => this.onChange(e)} className="form-control" />
            </div>
            <input type="submit" value="Submit" className="btn btn-primary" />
          </form>
        ) : (
          <Fragment>
            UID: {this.state.uid}
            <br />
          </Fragment>
        )}
      </div>
    );
  }
}
