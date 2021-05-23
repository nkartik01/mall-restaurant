import axios from "axios";
import React, { Component } from "react";
import ReactToPrint from "react-to-print";

export default class Example extends React.PureComponent {
  render() {
    return (
      <div align="center">
        <div className="col-md-10">
          <Report />
        </div>
      </div>
    );
  }
}
class Report extends Component {
  state = {
    bills: [],
    sum: 0,
    sums: {},
    restaurant: "overall",
    restaurants: [],
    what: "summary",
  };
  getRestaurants = async () => {
    var res = await axios.get(
      require("../config.json").url + "menu/restaurants"
    );
    console.log(res.data);

    this.setState({ restaurants: res.data.restaurants });
  };
  componentDidMount() {
    this.getRestaurants();
    var date = new Date();
    this.setState({
      start:
        date.getFullYear().toString() +
        "-" +
        (date.getMonth() + 1).toString().padStart(2, 0) +
        "-" +
        date.getDate().toString().padStart(2, 0),
      end:
        date.getFullYear().toString() +
        "-" +
        (date.getMonth() + 1).toString().padStart(2, 0) +
        "-" +
        date.getDate().toString().padStart(2, 0),
    });
  }
  render() {
    return (
      <div align="center">
        <div
          ref={(el) => (this.componentRef = el)}
          style={{ alignContent: "center", paddingLeft: "5px" }}
        >
          <form
            align="center"
            onSubmit={async (e) => {
              e.preventDefault();
              var res = await axios.post(
                require("../config.json").url + "report/sale",
                {
                  start: new Date(this.state.start).valueOf(),
                  end: new Date(this.state.end).valueOf(),
                  restaurant: this.state.restaurant,
                }
              );
              res = res.data;
              console.log(res);
              this.setState({ ...res, fetched: true });
              // .toLocaleString("en-GB"));
            }}
          >
            <table
              className="table table-bordered"
              style={{ width: "fit-content" }}
            >
              <tbody>
                <tr>
                  <th scope="col">Start Date</th>
                  <th scope="col">End Date</th>
                </tr>
                <tr>
                  <td>
                    <input
                      type="date"
                      value={this.state.start}
                      onChange={(e) => {
                        e.preventDefault();
                        this.setState({ start: e.target.value });
                      }}
                    />
                  </td>
                  <td>
                    <input
                      type="date"
                      value={this.state.end}
                      onChange={(e) => {
                        e.preventDefault();
                        this.setState({ end: e.target.value });
                      }}
                    />
                  </td>
                </tr>
                <tr>
                  <td>
                    <select
                      value={this.state.restaurant}
                      onChange={(e) => {
                        e.preventDefault();
                        this.setState({ restaurant: e.target.value });
                      }}
                    >
                      <option value="overall">Overall</option>
                      {this.state.restaurants.map((restaurant, _) => {
                        return (
                          <option value={restaurant.restaurantId}>
                            {restaurant.restaurantId}
                          </option>
                        );
                      })}
                    </select>
                  </td>
                  <td>
                    <select
                      value={this.state.what}
                      onChange={(e) => {
                        e.preventDefault();
                        this.setState({ what: e.target.value });
                      }}
                    >
                      <option value="summary">Summary</option>
                      <option value="billList">Bill List</option>
                      <option value="itemWise">Item Wise Sale</option>
                      <option value="return">Edited Bills</option>
                      <option value="cancelled">Cancelled Bills</option>
                    </select>
                  </td>
                </tr>
                <tr>
                  <td colSpan={1}>
                    <input
                      type="submit"
                      className="btn btn-primary"
                      value="Submit"
                    />
                  </td>
                  <td>
                    {" "}
                    <ReactToPrint
                      trigger={() => {
                        // NOTE: could just as easily return <SomeComponent />. Do NOT pass an `onClick` prop
                        // to the root node of the returned component as it will be overwritten.
                        return (
                          <button className="btn btn-primary">Print</button>
                        );
                      }}
                      content={() => this.componentRef}
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </form>
          {this.state.fetched ? (
            <div className="col-md-10">
              <table
                className="table table-bordered"
                style={{ width: "fit-content" }}
                hidden={this.state.what === "summary" ? false : true}
              >
                <thead>
                  <tr>
                    <th scope="col">Total Sale</th>
                    <td>{this.state.sum}</td>
                  </tr>
                  <tr>
                    <th scope="col">Discounts</th>

                    <td>{this.state.discAmount}</td>
                  </tr>
                  <tr>
                    <th>Net Sale</th>
                    <td>
                      {this.state.cashSum +
                        this.state.rfidSum +
                        this.state.cardSum +
                        this.state.upiSum +
                        this.state.balance}
                    </td>
                  </tr>
                  <tr>
                    <th scope="col">Cash Collected</th>

                    <td>{this.state.cashSum}</td>
                  </tr>
                  <tr>
                    <th scope="col">RFID payments</th>
                    <td>{this.state.rfidSum}</td>
                  </tr>
                  <tr>
                    <th scope="col">Card Payments</th>
                    <td>{this.state.cardSum}</td>
                  </tr>
                  <tr>
                    <th scope="col">UPI Payments</th>
                    <td>{this.state.upiSum}</td>
                  </tr>
                  <tr>
                    <th scope="col">Credit</th>
                    <td>{this.state.balance}</td>
                  </tr>
                  <tr>
                    <th>Cancelled Bills</th>
                    <td>{this.state.cancelled.length}</td>
                  </tr>
                </thead>
              </table>
              <div hidden={this.state.what === "billList" ? false : true}>
                <h4>Bills</h4>
                <table
                  className="table table-bordered"
                  style={{ width: "fit-content" }}
                >
                  <thead>
                    <tr>
                      {/* <th scope="col">Sr. No.</th> */}
                      <th scope="col">Bill Id</th>
                      {/* <th scope="col">To</th> */}
                      <th scope="col">Amount</th>
                      {/* <th scope="col">Balance</th> */}
                      {/* <th scope="col">Generated At</th> */}
                      {/* <th scope="col">Go to bill</th> */}
                    </tr>
                  </thead>
                  <tbody>
                    {this.state.bills.map((bill, ind) => {
                      return (
                        <tr>
                          {/* <th scope="row">{ind + 1}</th> */}
                          <td>{bill.billId}</td>
                          {/* <td>{bill.to}</td> */}
                          <td align="right">
                            {bill.finalOrder.sum -
                              parseInt(bill.discAmount ? bill.discAmount : 0)}
                          </td>
                          {/* <td>{bill.balance}</td> */}
                          {/* <td>{new Date(bill.at).toLocaleString("en-GB")}</td> */}
                          {/* <td>
                    <Link to={"/bill/" + bill.id} className="btn btn-primary">
                      View Bill
                    </Link>
                  </td> */}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div hidden={this.state.what === "itemWise" ? false : true}>
                <h4>Item Wise Sale</h4>
                <table
                  className="table table-bordered"
                  style={{ width: "fit-content" }}
                >
                  <thead>
                    <tr>
                      {/* <th scope="col">Sr. No.</th> */}
                      <th scope="col">Item Name</th>
                      <th scope="col">Price</th>
                      <th scope="col">Quantity</th>
                      <th scope="col">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {this.state.itemwise.map((item, ind) => {
                      return (
                        <tr>
                          {/* <th scope="row">{ind + 1}</th> */}
                          <td>{item.item}</td>
                          <td>{item.price}</td>
                          <td>{item.quantity}</td>
                          <td align="right">{item.quantity * item.price}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div hidden={this.state.what === "return" ? false : true}>
                <h4>Order Return Details</h4>
                <ol>
                  {this.state.itemwiseEdit.map((order1, ind) => {
                    return (
                      <li>
                        <h5 align="left">
                          At:{" "}
                          {new Date(order1.at).toLocaleString("en-GB") +
                            (order1.type === "edit"
                              ? ", By: " +
                                order1.by +
                                ",  Reason: " +
                                order1.reason
                              : "")}{" "}
                        </h5>
                        <table
                          className="table table-bordered"
                          style={{ width: "fit-content" }}
                        >
                          <thead>
                            <tr>
                              {/* <th scope="col">Sr. No.</th> */}
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
                                  {/* <th scope="row">{ind + 1}</th> */}
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
              </div>

              <div hidden={this.state.what === "cancelled" ? false : true}>
                {this.state.cancelled.map((bill) => {
                  return (
                    <p>
                      {bill.billId} - {bill.reason}
                    </p>
                  );
                })}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    );
  }
}
