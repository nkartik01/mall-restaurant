import axios from "axios";
import React, { Component } from "react";
import config from "../config.json";
import AlertDiv from "../AlertDiv";
export default class Revert extends Component {
  state = { orders: [] };
  componentDidMount() {
    this.getRecent();
  }
  getRecent = async () => {
    var res = await axios.get(config.url + "chef/getRecent", {
      headers: { "x-auth-token": localStorage.getItem("token") },
    });

    console.log(res.data);
    res = res.data;
    this.setState({ orders: res });
  };
  render() {
    var orders = this.state.orders;
    return (
      <div>
        <h2>Select the orders to revert</h2>
        <div class="row">
          {orders.map((order, i) => {
            console.log(order);
            return (
              <div
                // className="col-md-4"

                style={{
                  backgroundColor: order.done === true ? "#90ee90" : "red",
                  width: "fit-content",
                  margin: "3px",
                }}
              >
                <h5>Order {order.orderNo}</h5>
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
                              "Are you sure you want to revert this order?"
                            );
                            if (!confirm) return;
                            await axios.post(
                              require("../config.json").url + "chef/revert",
                              { id: order._id },
                              {
                                headers: {
                                  "x-auth-token": localStorage.getItem("token"),
                                },
                              }
                            );
                            AlertDiv("green", "Done");
                            this.getRecent();
                          }}
                        >
                          Revert
                        </button>
                      </td>
                      <td></td>
                      <td>
                        {/* <button
                          className="btn btn-warning"
                          onClick={(e) => {
                            e.preventDefault();
                          }}
                        >
                          Cancel
                        </button> */}
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
