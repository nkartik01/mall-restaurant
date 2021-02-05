import axios from "axios";
import React, { Component, Fragment } from "react";
import Payment from "./Payment";
// const printer = require("printer");
export default class Bill extends Component {
  state = { isLoading: true, bill: {} };
  getBill = async () => {
    var bill = await axios.get(require("../config.json").url + "bill/getBill/" + this.props.match.params.id, {
      headers: { "x-auth-token": localStorage.getItem("token") },
    });
    bill = bill.data.bill;
    bill.amount = 0;
    bill.orderChanges.map((order, i) => {
      bill.amount = bill.amount + order.sum;
      return null;
    });
    if (!bill.transactions) {
      bill.transactions = [];
    }
    console.log(bill);
    this.setState({ bill: bill, isLoading: false });
  };
  componentDidMount() {
    this.getBill();
  }
  render() {
    // console.log(printer.getPrinters());
    var bill = this.state.bill;
    return (
      <div>
        {!this.state.isLoading ? (
          <div>
            <table className="table table-bordered">
              <tbody>
                <tr>
                  <th scope="row">id</th>
                  <td>
                    <h3>{bill.id}</h3>
                  </td>
                </tr>
                <tr>
                  <th scope="row">Given to</th>
                  <td>{bill.to}</td>
                </tr>
                <tr>
                  <th scope="row">Balance</th>
                  <td>{bill.balance}</td>
                </tr>
                <tr>
                  <th scope="row">Total Amount</th>
                  <td>{bill.amount}</td>
                </tr>
                {bill.discType && bill.discType !== "none" ? (
                  <Fragment>
                    <tr>
                      <th scope="row">Discount Type</th>
                      <td>{bill.discType}</td>
                    </tr>
                    <tr>
                      <th scope="row">Discount Amount</th>
                      <td>{bill.discAmount}</td>
                    </tr>
                    <tr>
                      <th scope="row">Discount Reason</th>
                      <td>{bill.discReason}</td>
                    </tr>
                    <tr>
                      <th scope="row">Discount By</th>
                      <td>{bill.discBy}</td>
                    </tr>
                  </Fragment>
                ) : null}
                <tr>
                  <th scope="row">Restaurant</th>
                  <td>{bill.restaurant}</td>
                </tr>
                <tr>
                  <th scope="row">Table</th>
                  <td>{bill.table}</td>
                </tr>
              </tbody>
            </table>

            <h4>Order Details</h4>
            <table className="table table-bordered">
              <thead>
                <tr>
                  <th scope="col">Sr. No.</th>
                  <th scope="col">Item Name</th>
                  <th scope="col">Price</th>
                  <th scope="col">Quantity</th>
                  <th scope="col">Amount</th>
                </tr>
              </thead>
              <tbody>
                {bill.finalOrder.order.map((order, ind) => {
                  return (
                    <tr>
                      <th scope="row">{ind + 1}</th>
                      <td>{order.item}</td>
                      <td>{order.price}</td>
                      <td>{order.quantity}</td>
                      <td>{order.quantity * order.price}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <h3>Order Breakdown</h3>
            <ol>
              {bill.orderChanges.map((order1, ind) => {
                return (
                  <li>
                    <h5 align="left">At: {new Date(order1.at).toLocaleString("en-GB") + (order1.type === "edit" ? ", By: " + order1.by + ",  Reason: " + order1.reason : "")} </h5>
                    <table className="table table-bordered">
                      <thead>
                        <tr>
                          <th scope="col">Sr. No.</th>
                          <th scope="col">Item Name</th>
                          <th scope="col">Price</th>
                          <th scope="col">Quantity</th>
                          <th scope="col">Amount</th>
                        </tr>
                      </thead>
                      <tbody style={{ color: order1.type === "edit" ? "red" : "black" }}>
                        {order1.order.map((order, ind) => {
                          return (
                            <tr>
                              <th scope="row">{ind + 1}</th>
                              <td>{order.item}</td>
                              <td>{order.price}</td>
                              <td>{order.quantity}</td>
                              <td>{order.quantity * order.price}</td>
                            </tr>
                          );
                        })}
                        <td />
                        <td />
                        <td />
                        <td />
                        <th>{order1.sum}</th>
                      </tbody>
                    </table>
                  </li>
                );
              })}
            </ol>
            <h4>Transactions</h4>
            <table className="table table-bordered">
              <thead>
                <th scope="col">Sr. No.</th>
                <th scope="col">Time</th>
                <th scope="col">type</th>
                <th scope="col">By</th>
                <th scope="col">Amount</th>
              </thead>
              <tbody>
                {bill.transactions.map((trans, ind) => {
                  return (
                    <tr>
                      <th scope="row">{ind + 1}</th>
                      <td>{new Date(parseInt(trans.at)).toLocaleString("en-GB")}</td>
                      <td>{trans.type}</td>
                      <td>{trans.by}</td>
                      <td>{trans.amount}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div>
              <Payment
                restaurant={bill.restaurant}
                disable={bill.balance === 0 ? true : false}
                amount={bill.balance}
                bill={bill.id}
                orderHistory={bill.finalOrder}
                afterDisc={this.getBill}
                callBack={(amount) => {
                  this.setState({ bill: { ...this.state.bill, balance: this.state.bill.balance - amount } });
                  this.getBill();
                }}
              />
            </div>
          </div>
        ) : null}
      </div>
    );
  }
}
