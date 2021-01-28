import axios from "axios";
import React, { Component } from "react";
import Payment from "./Payment";

export default class Bill extends Component {
  state = { isLoading: true, bill: {} };
  getBill = async () => {
    var bill = await axios.get("http://192.168.1.178:5001/mall-restraunt/us-central1/api/bill/getBill/" + this.props.match.params.id, {
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
                    <h5 align="left">At: {new Date(order1.at).toLocaleString()}</h5>
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
                      <td>{new Date(parseInt(trans.at)).toLocaleString()}</td>
                      <td>{trans.type}</td>
                      <td>{trans.by}</td>
                      <td>{trans.amount}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <Payment
              disable={false}
              amount={bill.balance}
              bill={bill.id}
              callBack={(amount) => {
                this.setState({ bill: { ...this.state.bill, balance: this.state.bill.balance - amount } });
                this.getBill();
              }}
            />
          </div>
        ) : null}
      </div>
    );
  }
}