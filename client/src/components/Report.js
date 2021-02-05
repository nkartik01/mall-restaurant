import axios from "axios";
import React, { Component, Fragment } from "react";
import ReactToPrint from "react-to-print";

export default class Example extends React.PureComponent {
  render() {
    return (
      <div align="center">
        <div className="col-md-10">
          <ReactToPrint
            trigger={() => {
              // NOTE: could just as easily return <SomeComponent />. Do NOT pass an `onClick` prop
              // to the root node of the returned component as it will be overwritten.
              return <button>Print this out!</button>;
            }}
            content={() => this.componentRef}
          />
          <Report ref={(el) => (this.componentRef = el)} />
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
  }
  render() {
    return (
      <div align="center">
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
                    {this.state.restaurants.map((menu, _) => {
                      return <option value={menu.id}>{menu.id}</option>;
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
          <Fragment>
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
                      <td>{bill.id}</td>
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
            <table className="table">
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
                {Object.keys(this.state.itemwise)
                  .sort()
                  .map((item, ind) => {
                    return (
                      <tr>
                        <th scope="row">{ind + 1}</th>
                        <td>{item}</td>
                        <td>{this.state.itemwise[item].price}</td>
                        <td>{this.state.itemwise[item].quantity}</td>
                        <td align="right">{this.state.itemwise[item].quantity * this.state.itemwise[item].price}</td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
            <h4>Item wise return</h4>
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
              <tbody style={{ color: "red" }}>
                {Object.keys(this.state.itemwiseEdit)
                  .sort()
                  .map((item, ind) => {
                    return (
                      <tr>
                        <th scope="row">{ind + 1}</th>
                        <td>{item}</td>
                        <td>{this.state.itemwiseEdit[item].price}</td>
                        <td>{this.state.itemwiseEdit[item].quantity}</td>
                        <td align="right">{this.state.itemwiseEdit[item].quantity * this.state.itemwiseEdit[item].price}</td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </Fragment>
        ) : null}
      </div>
    );
  }
}
