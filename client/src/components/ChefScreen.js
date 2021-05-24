import axios from "axios";
import React, { Component } from "react";
import AlertDiv from "../AlertDiv";
import config from "../config.json";
export default class ChefScreen extends Component {
  state = { orders: [] };
  componentDidMount() {
    this.getOrders();
    this.interval = setInterval(() => {
      this.getOrders();
    }, 10000);
  }
  getOrders = async () => {
    var res = await axios.get(
      require("../config.json").url + "chef/getPendingOrders",
      {
        headers: { "x-auth-token": localStorage.getItem("token") },
      }
    );
    this.setState({ orders: res.data });
  };
  componentWillUnmount() {
    clearInterval(this.interval);
  }
  render() {
    var orders = this.state.orders;
    return (
      <div>
        <h2>Current Orders</h2>
        <div class="row">
          {orders.map((order, i) => {
            var time = Date.now() - order.at;
            console.log(order);
            return (
              <div
                // className="col-md-4"

                style={{
                  backgroundColor:
                    time < 600000
                      ? "#90ee90"
                      : time < 900000
                      ? "orange"
                      : "red",
                  width: "fit-content",
                  margin: "3px",
                }}
              >
                <h5>
                  Order {order.orderNo} - ({(time - (time % 60000)) / 60000}
                  {":"}
                  {(((time - (time % 1000)) % 60000) / 1000)
                    .toString()
                    .padStart(2, "0")}
                  )
                </h5>
                <p>
                  {order.restaurant} - {order.table}
                </p>
                <table
                  className="table table-bordered"
                  style={{ width: "fit-content" }}
                >
                  <thead>
                    <tr>
                      <th scope="col">S No.</th>
                      <th scope="col">Item</th>
                      {/* <th scope="col">Price</th> */}
                      <th scope="col">Quantity</th>
                      {/* <th scope="col">Amount</th> */}
                    </tr>
                  </thead>
                  <tbody>
                    {order.order.map((item, i) => {
                      return (
                        <tr key={i}>
                          <th scope="row">{i + 1}</th>
                          <th>{item.item}</th>
                          {/* <td>{item.price}</td> */}
                          <th>{item.quantity}</th>
                          {/* <td>{item.price * item.quantity}</td> */}
                        </tr>
                      );
                    })}
                    <tr>
                      <td>
                        <button
                          className="btn btn-primary"
                          onClick={async (e) => {
                            e.preventDefault();
                            var confirm = window.confirm(
                              "Are you sure you want to mark this order as done?"
                            );
                            if (!confirm) return;
                            await axios.post(
                              config.url + "chef/setAsDone",
                              { id: order._id },
                              {
                                headers: {
                                  "x-auth-token": localStorage.getItem("token"),
                                },
                              }
                            );
                            AlertDiv("green", "Done");
                            this.getOrders();
                          }}
                        >
                          Done
                        </button>
                      </td>
                      <td></td>
                      <td>
                        <button
                          className="btn btn-warning"
                          onClick={async (e) => {
                            e.preventDefault();

                            var confirm = window.confirm(
                              "Are you sure you want to Cancel this order?"
                            );
                            if (!confirm) return;
                            await axios.post(
                              config.url + "chef/cancelOrder",
                              { id: order._id },
                              {
                                headers: {
                                  "x-auth-token": localStorage.getItem("token"),
                                },
                              }
                            );
                          }}
                        >
                          Cancel
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
}
