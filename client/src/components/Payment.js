import React, { Component } from "react";
import axios from "axios";
import AlertDiv from "../AlertDiv";
export default class Payment extends Component {
  state = { partial: false, partialAmount: 0 };
  render() {
    return (
      <div>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            try {
              // console.log()
              var tranAmount = parseInt(this.state.partial ? parseInt(this.state.partialAmount) : parseInt(this.props.amount));
              console.log(tranAmount, this.state.partial, this.props.amount);
              console.log(this.state.uid, this.state.partial ? tranAmount : this.props.amount);
              var pay = await axios.post(
                "http://192.168.1.178:5001/mall-restraunt/us-central1/api/card/deductAmount",
                {
                  // amount: this.props.table.partial ? partAmont) : this.props.table.orderHistory.sum,

                  amount: tranAmount,
                  to: this.state.partial ? this.state.to : undefined,
                  uid: this.state.uid,
                  bill: this.props.bill,
                  table: !this.props.table ? false : this.props.table,
                },
                { headers: { "x-auth-token": localStorage.getItem("token") } }
              );
              console.log(pay);
              this.setState({ partial: false, partialAmount: 0, uid: "" });
              AlertDiv("green", "Paid");
              if (!!this.props.callBack) {
                this.props.callBack(tranAmount);
              }
            } catch (err) {
              if (!!this.props.fallBack) {
                this.props.fallBack();
              }
              this.setState({ uid: "" });
              console.log(err, err.response);
              AlertDiv("red", "Couldn't Deduct Money, " + err.response.data);
            }
          }}
        >
          <input
            type="checkbox"
            id="partial"
            disabled={this.props.disable}
            // disabled={this.props.table.orderChange.sum !== 0 || this.props.table.orderHistory.sum === 0 ? true : false}
            value={this.state.partial}
            onChange={(e) => {
              this.setState({ partial: e.target.checked });
            }}
          />
          <label htmlFor="partial">Partial Payment?</label>
          <input
            type="number"
            id="partialAmount"
            max={this.props.amount}
            min={1}
            className="form-control"
            required
            placeholder="Partial Amount"
            value={this.state.partialAmount}
            onChange={(e) => {
              e.preventDefault();
              var value = e.target.value === "" ? 0 : parseInt(e.target.value);
              this.setState({ partialAmount: value });
            }}
            disabled={!this.state.partial || this.props.disable ? true : false}
          />
          <input
            disabled={!this.state.partial || this.props.disable ? true : false}
            type="text"
            required
            className="form-control"
            placeholder="Partial privalage given to"
            id="to"
            name="to"
            value={this.state.to}
            onChange={(e) => {
              e.preventDefault();
              this.setState({ to: e.target.value });
            }}
          />
          <br />
          <input
            placeholder="UID"
            type="text"
            id="uidInput"
            value={this.state.uid}
            autoFocus
            onChange={(e) => {
              e.preventDefault();
              this.setState({ uid: e.target.value });
            }}
            required
            disabled={this.props.disable}
          />
          <input type="submit" value="Pay by Card" disabled={this.props.disable} />
        </form>
      </div>
    );
  }
}
