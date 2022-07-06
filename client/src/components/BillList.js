import axios from "axios";
import React, { Component, Fragment } from "react";
import { Link } from "react-router-dom";
import ReactToPrint from "react-to-print";
import { setData } from "../redux/action/loadedData";

export default class BillList extends Component {
  componentRef = React.createRef();
  getRestaurants = async () => {
    var res = await axios.get(
      localStorage.getItem("apiUrl") + "menu/restaurants"
    );
    console.log(res.data);

    this.setState({ restaurants: res.data.restaurants });
  };
  state = {
    bills: this.props.store.getState().loadedDataReducer.bills
      ? this.props.store.getState().loadedDataReducer.bills
      : [],
    reverseBills: [],
    restaurants: [],
    restaurant: "overall",
  };
  getBills = async () => {
    var bills = await axios.post(
      localStorage.getItem("apiUrl") + "bill/listBills",
      {
        start: this.state.start,
        end: this.state.end,
        restaurant: this.state.restaurant,
      },
      {
        headers: { "x-auth-token": localStorage.getItem("token") },
      }
    );
    console.log(bills);
    bills = bills.data.bills;
    var reverseBills = bills.slice().reverse();
    console.log(reverseBills);
    this.setState({ bills, reverseBills });
    this.props.store.dispatch(setData({ bills }));
  };
  printBills = () => {};
  getPending = async (e) => {
    e.preventDefault();
    var bills = await axios.post(
      localStorage.getItem("apiUrl") + "bill/pendingBills",
      { start: this.state.start, end: this.state.end },
      {
        headers: { "x-auth-token": localStorage.getItem("token") },
      }
    );
    bills = bills.data.bills;
    this.setState({ bills });
    this.props.store.dispatch(setData({ bills }));
  };
  componentDidMount() {
    var date = new Date();
    this.getRestaurants();
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
    this.getBills();
  }
  render() {
    return (
      <div>
        <form
          align="center"
          onSubmit={async (e) => {
            e.preventDefault();
            this.getBills();
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
                  <input
                    type="submit"
                    className="btn btn-primary"
                    value="Submit"
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </form>

        {/* <button className="btn btn-primary" onClick={(e) => this.getPending(e)}>
          Get Pending Bills
        </button> */}
        <ReactToPrint
          trigger={() => {
            // NOTE: could just as easily return <SomeComponent />. Do NOT pass an `onClick` prop
            // to the root node of the returned component as it will be overwritten.
            return <button className="btn btn-primary">Print</button>;
          }}
          content={() => this.componentRef}
        />
        <table className="table table-bordered">
          <thead>
            <tr>
              <th scope="col">Sr. No.</th>
              <th scope="col">Bill Id</th>
              <th scope="col">Table</th>
              <th scope="col">To</th>
              <th scope="col">Amount</th>
              <th scope="col">Balance</th>
              <th scope="col">Generated At</th>
              <th scope="col">Go to bill</th>
            </tr>
          </thead>
          <tbody>
            {this.state.bills.map((bill, ind) => {
              return (
                <tr
                  style={{ color: bill.cancelled ? "red" : "black" }}
                  key={ind}
                >
                  <td>{ind + 1}</td>
                  <td>{bill.id}</td>
                  <td>{bill.table}</td>
                  <td>{bill.to}</td>
                  <td>{bill.finalOrder.sum}</td>
                  <td>{bill.balance}</td>
                  <td>{new Date(bill.at).toLocaleString("en-GB")}</td>
                  <td>
                    <Link to={"/bill/" + bill.id} className="btn btn-primary">
                      View Bill
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div
          className="hiddenPrint"
          ref={(el) => (this.componentRef = el)}
          style={{
            paddingLeft: "1.5in",
            paddingRight: "1.5in",
            alignItems: "center",
          }}
        >
          {this.state.reverseBills.map((bill, ind) => {
            return (
              <div
                style={{
                  border: "2px solid black",
                  paddingTop: "0.5in",
                  paddingBottom: "0.5in",
                }}
                className="pagebreak"
              >
                {bill.cancelled ? (
                  <h2 style={{ color: "red" }}>Cancelled ({bill.reason})</h2>
                ) : null}

                <table
                  align="center"
                  className="table-bordered"
                  style={{ border: "2px solid black" }}
                >
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
                      <td>{bill.finalOrder.sum}</td>
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
                <p>Order Details</p>
                <table
                  align="center"
                  className="table-bordered"
                  style={{ border: "2px solid black" }}
                >
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

                <p>Transactions</p>
                <table
                  align="center"
                  className="table-bordered"
                  style={{ border: "2px solid black" }}
                >
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
                          <td>
                            {new Date(parseInt(trans.at)).toLocaleString(
                              "en-GB"
                            )}
                          </td>
                          <td>{trans.type}</td>
                          <td>{trans.by}</td>
                          <td>{trans.amount}</td>
                        </tr>
                      );
                    })}
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
