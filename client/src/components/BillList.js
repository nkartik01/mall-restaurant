import axios from "axios";
import React, { Component } from "react";
import { Link } from "react-router-dom";
import { setData } from "../redux/action/loadedData";

export default class BillList extends Component {
  state = { bills: this.props.store.getState().loadedDataReducer.bills ? this.props.store.getState().loadedDataReducer.bills : [] };
  getBills = async () => {
    var bills = await axios.post(
      require("../config.json").url + "bill/listBills",
      { start: this.state.start, end: this.state.end },
      {
        headers: { "x-auth-token": localStorage.getItem("token") },
      }
    );
    console.log(bills);
    bills = bills.data.bills;
    this.setState({ bills });
    this.props.store.dispatch(setData({ bills }));
  };
  getPending = async (e) => {
    e.preventDefault();
    var bills = await axios.post(
      require("../config.json").url + "bill/pendingBills",
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
    this.setState({
      start: date.getFullYear().toString() + "-" + (date.getMonth() + 1).toString().padStart(2, 0) + "-" + date.getDate().toString().padStart(2, 0),
      end: date.getFullYear().toString() + "-" + (date.getMonth() + 1).toString().padStart(2, 0) + "-" + date.getDate().toString().padStart(2, 0),
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
                {/* <td>
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
                </td> */}
              </tr>
              <tr>
                <td colSpan={3}>
                  <input type="submit" className="btn btn-primary" value="Submit" />
                </td>
              </tr>
            </tbody>
          </table>
        </form>

        <button className="btn btn-primary" onClick={(e) => this.getPending(e)}>
          Get Pending Bills
        </button>
        <table className="table table-bordered">
          <thead>
            <tr>
              <th scope="col">Sr. No.</th>
              <th scope="col">Bill Id</th>
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
                <tr style={{ color: bill.cancelled ? "red" : "black" }}>
                  <td>{ind + 1}</td>
                  <td>{bill.id}</td>
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
      </div>
    );
  }
}
