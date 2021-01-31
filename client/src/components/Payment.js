import React, { Component } from "react";
import axios from "axios";
import AlertDiv from "../AlertDiv";
export default class Payment extends Component {
  state = { partial: false, partialAmount: 0 };
  render() {
    return (
      <div>
        <form id="partialForm" onSubmit={(e) => e.preventDefault()}>
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
        </form>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            try {
              // console.log()
              var tranAmount = parseInt(this.state.partial ? parseInt(this.state.partialAmount) : parseInt(this.props.amount));
              await axios.post(
                "http://192.168.2.171:5001/mall-restraunt/us-central1/api/card/deductAmount",
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
              await axios.post(
                "http://192.168.2.171:5001/mall-restraunt/us-central1/api/bill/printBill",
                {
                  bill: this.props.bill,
                  balance: this.props.amount,
                  orderHistory: this.props.orderHistory,
                  paid: tranAmount,
                  printer: localStorage.getItem("printer"),
                  method: "card",
                  uid: this.state.uid,
                },
                { headers: { "x-auth-token": localStorage.getItem("token") } }
              );
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
        <form
          id="cashForm"
          onSubmit={async (e) => {
            e.preventDefault();

            try {
              // console.log()
              var tranAmount = parseInt(this.state.partial ? parseInt(this.state.partialAmount) : parseInt(this.props.amount));
              await axios.post(
                "http://192.168.2.171:5001/mall-restraunt/us-central1/api/bill/byCash",
                {
                  // amount: this.props.table.partial ? partAmont) : this.props.table.orderHistory.sum,

                  amount: tranAmount,
                  to: this.state.partial ? this.state.to : undefined,
                  bill: this.props.bill,
                  table: !this.props.table ? false : this.props.table,
                },
                { headers: { "x-auth-token": localStorage.getItem("token") } }
              );
              this.setState({ partial: false, partialAmount: 0, uid: "" });
              AlertDiv("green", "Paid");
              await axios.post(
                "http://192.168.2.171:5001/mall-restraunt/us-central1/api/bill/printBill",
                {
                  bill: this.props.bill,
                  balance: this.props.amount,
                  orderHistory: this.props.orderHistory,
                  paid: tranAmount,
                  printer: localStorage.getItem("printer"),
                  method: "cash",
                },
                { headers: { "x-auth-token": localStorage.getItem("token") } }
              );
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
          <input className="form-control" type="submit" value="Cash Accepted" disabled={this.props.disable} />
        </form>
        {/* <button
          className="btn  btn-primary"
          onClick={async (e) => {
            e.preventDefault();

            await axios.post(
              "http://192.168.2.171:5001/mall-restraunt/us-central1/api/bill/printBill",
              { bill: this.props.bill, balance: this.props.amount, orderHistory: this.props.orderHistory, paid: this.props.tranAmount, printer: localStorage.getItem("printer") },
              { headers: { "x-auth-token": localStorage.getItem("token") } }
            );
          }}
        >
          Print Bill
        </button> */}
      </div>
    );
  }
}
