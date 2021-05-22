import axios from "axios";
import React, { Component } from "react";
import Masonry from "react-masonry-component";
import AlertDiv from "../AlertDiv";
export default class ChefScreen extends Component {
  state = { orders: [] };
  componentDidMount() {
    this.getOrders();
  }
  getOrders = async () => {
    var res = await axios.get("http://192.168.2.2:5000/chef/getPendingOrders", {
      headers: { "x-auth-token": localStorage.getItem("token") },
    });
    this.setState({ orders: res.data });
  };
  render() {
    var orders = this.state.orders;
    return (
      <div>
        <div class="row">
          {orders.map((order, i) => {
            var time = Date.now() - order.at;
            console.log(time);
            return (
              <div
                // className="col-md-4"

                style={{
                  backgroundColor:
                    time < 600000 ? "green" : time < 900000 ? "orange" : "red",
                  width: "fit-content",
                  margin: "3px",
                }}
              >
                <h5>
                  Order {order.orderNo} - {time / 60000} Minutes
                </h5>
                <table
                  className="table table-bordered"
                  style={{ width: "fit-content" }}
                >
                  <thead>
                    <tr>
                      <th scope="col">S No.</th>
                      <th scope="col">Item</th>
                      <th scope="col">Price</th>
                      <th scope="col">Quantity</th>
                      <th scope="col">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.order.map((item, i) => {
                      return (
                        <tr key={i}>
                          <th scope="row">{i + 1}</th>
                          <td>{item.item}</td>
                          <td>{item.price}</td>
                          <td>{item.quantity}</td>
                          <td>{item.price * item.quantity}</td>
                        </tr>
                      );
                    })}
                    <tr>
                      <td />
                      <td />
                      <td />
                      <td />
                      <th>{order.sum}</th>
                    </tr>
                    <tr>
                      <td colSpan={2}>
                        <button
                          className="btn btn-primary"
                          onClick={async (e) => {
                            e.preventDefault();
                            await axios.post(
                              "http://192.168.2.2:5000/chef/setAsDone",
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
                      <td colSpan={2}>
                        <button
                          className="btn btn-warning"
                          onClick={(e) => {
                            e.preventDefault();
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
