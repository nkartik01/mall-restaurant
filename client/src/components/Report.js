import axios from "axios";
import React, { Component, Fragment } from "react";

export default class Report extends Component {
  state = { bills: [], sum: 0, sums: {} };
  render() {
    return (
      <div>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            var res = await axios.post("http://" + require("../config.json").ip + ":5001/mall-restraunt/us-central1/api/report/sale", {
              start: new Date(this.state.start).valueOf(),
              end: new Date(this.state.end).valueOf(),
            });
            res = res.data;
            var sum = 0;
            this.state.bills = res.bills;
            this.state.bills.map((bill, _) => {
              sum = sum + bill.finalOrder.sum;
              return;
            });
            var upiSum = 0;
            var cashSum = 0;
            var rfidSum = 0;
            var cardSum = 0;

            var itemwise = {};
            var itemwiseEdit = {};
            this.state.bills.map((bill, _) => {
              try {
                bill.finalOrder.order.map((item, _) => {
                  if (!itemwise[item.item]) {
                    itemwise[item.item] = { quantity: 0, price: item.price };
                  }
                  itemwise[item.item].quantity = itemwise[item.item].quantity + item.quantity;
                });
              } catch {}

              console.log(
                bill.orderChanges.filter((order, _) => {
                  if (order.type === "edit") {
                    return true;
                  }
                  return false;
                })
              );
              //   try {
              bill.orderChanges
                .filter((order, _) => {
                  if (order.type === "edit") {
                    return true;
                  }
                  return false;
                })
                .map((order, _) => {
                  order.order.map((item, _) => {
                    if (!itemwiseEdit[item.item]) {
                      itemwiseEdit[item.item] = { quantity: 0, price: item.price };
                    }
                    itemwiseEdit[item.item].quantity = itemwiseEdit[item.item].quantity + item.quantity;
                    console.log(itemwiseEdit[item.item]);
                    return;
                  });
                  return;
                });
              //   } catch {}
              try {
                bill.transactions.map((tran, _) => {
                  if (tran.type === "cash") cashSum = cashSum + tran.amount;
                  if (tran.type === "card") cardSum = cardSum + tran.amount;
                  if (tran.type === "rfid") rfidSum = rfidSum + tran.amount;
                  if (tran.type === "upi") upiSum = upiSum + tran.amount;

                  return;
                });
              } catch {}
              return;
            });
            console.log(itemwise);
            console.log(itemwiseEdit);
            console.log(upiSum, cashSum, cardSum, rfidSum);
            this.setState({ bills: res.bills, sum });
            // .toLocaleString("en-GB"));
          }}
        >
          <table className="table table-bordered">
            <tbody>
              <tr>
                <th scope="row">Start Date</th>
                <th>
                  <input
                    type="date"
                    value={this.state.start}
                    onChange={(e) => {
                      e.preventDefault();
                      this.setState({ start: e.target.value });
                    }}
                  />
                </th>
              </tr>
              <tr>
                <th scope="row">End Date</th>
                <th>
                  <input
                    type="date"
                    value={this.state.end}
                    onChange={(e) => {
                      e.preventDefault();
                      this.setState({ end: e.target.value });
                    }}
                  />
                </th>
              </tr>
              <tr>
                <td colSpan={2}>
                  <input type="submit" className="btn btn-primary" />
                </td>
              </tr>
            </tbody>
          </table>
        </form>
        {this.state.bills.length !== 0 ? <Fragment>Total Sale: {this.state.sum}</Fragment> : null}
      </div>
    );
  }
}
