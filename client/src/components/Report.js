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
  state = { bills: [], sum: 0, sums: {}, restaurant: "overall", restaurants: [] };
  getRestaurants = async () => {
    var res = await axios.get(require("../config.json").url + "menu/restaurants");
    console.log(res.data);

    this.setState({ restaurants: res.data.restaurants });
  };
  componentDidMount() {
    this.getRestaurants();
    var date = new Date();
    this.setState({
      start: date.getFullYear().toString() + "-" + (date.getMonth() + 1).toString().padStart(2, 0) + "-" + date.getDate().toString().padStart(2, 0),
      end: date.getFullYear().toString() + "-" + (date.getMonth() + 1).toString().padStart(2, 0) + "-" + date.getDate().toString().padStart(2, 0),
    });
  }
  render() {
    return (
      <div align="center">
        <ReactToPrint
          trigger={() => {
            // NOTE: could just as easily return <SomeComponent />. Do NOT pass an `onClick` prop
            // to the root node of the returned component as it will be overwritten.
            return <button>Print this out!</button>;
          }}
          content={() => this.componentRef}
        />
        <form
          align="center"
          onSubmit={async (e) => {
            e.preventDefault();
            var res = await axios.post(require("../config.json").url + "report/sale", {
              start: new Date(this.state.start).valueOf(),
              end: new Date(this.state.end).valueOf(),
              restaurant: this.state.restaurant,
            });
            res = res.data;
            console.log(res);
            this.setState({ ...res });
            // .toLocaleString("en-GB"));
          }}
        >
          <table className="table table-bordered">
            <tbody>
              <tr>
                <th scope="col">Start Date</th>
                <th scope="col">End Date</th>
                <th scope="col">Restaurant</th>
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
                      return <option value={restaurant.restaurantId}>{restaurant.restaurantId}</option>;
                    })}
                  </select>
                </td>
              </tr>
              <tr>
                <td colSpan={3}>
                  <input type="submit" className="btn btn-primary" value="Submit" />
                </td>
              </tr>
            </tbody>
          </table>
        </form>
        {this.state.bills.length !== 0 ? (
          <div ref={(el) => (this.componentRef = el)} className="col-md-10" style={{ paddingLeft: "75px", paddingRight: "50px" }}>
            <table className="table table-bordered">
              <thead>
                <tr>
                  <th scope="col">Total Sale</th>
                  <th scope="col">Cash Collected</th>
                  <th scope="col">RFID payments</th>
                  <th scope="col">Card Payments</th>
                  <th scope="col">UPI Payments</th>
                  <th scope="col">Discounts</th>
                  <th scope="col">Credit</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{this.state.sum}</td>
                  <td>{this.state.cashSum}</td>
                  <td>{this.state.rfidSum}</td>
                  <td>{this.state.cardSum}</td>
                  <td>{this.state.upiSum}</td>
                  <td>{this.state.discAmount}</td>
                  <td>{this.state.balance}</td>
                </tr>
              </tbody>
            </table>
            <h4>Bills</h4>
            <table className="table table-bordered">
              <thead>
                <tr>
                  <th scope="col">Sr. No.</th>
                  <th scope="col">Bill Id</th>
                  {/* <th scope="col">To</th> */}
                  <th scope="col">Amount</th>
                  {/* <th scope="col">Balance</th> */}
                  <th scope="col">Generated At</th>
                  {/* <th scope="col">Go to bill</th> */}
                </tr>
              </thead>
              <tbody>
                {this.state.bills.map((bill, ind) => {
                  return (
                    <tr>
                      <th scope="row">{ind + 1}</th>
                      <td>{bill.billId}</td>
                      {/* <td>{bill.to}</td> */}
                      <td align="right">{bill.finalOrder.sum}</td>
                      {/* <td>{bill.balance}</td> */}
                      <td>{new Date(bill.at).toLocaleString("en-GB")}</td>
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
            <h4>Item Wise Sale</h4>
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
                {this.state.itemwise.map((item, ind) => {
                  return (
                    <tr>
                      <th scope="row">{ind + 1}</th>
                      <td>{item.item}</td>
                      <td>{item.price}</td>
                      <td>{item.quantity}</td>
                      <td align="right">{item.quantity * item.price}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <h4>Order Return Details</h4>
            <ol>
              {this.state.itemwiseEdit.map((order1, ind) => {
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
          </div>
        ) : null}
      </div>
    );
  }
}
