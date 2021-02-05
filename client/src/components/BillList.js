import axios from "axios";
import React, { Component } from "react";
import { Link } from "react-router-dom";
import { setData } from "../redux/action/loadedData";

export default class BillList extends Component {
  state = { bills: this.props.store.getState().loadedDataReducer.bills ? this.props.store.getState().loadedDataReducer.bills : [] };
  getBills = async () => {
    console.log(require("../config.json").ip);
    var bills = await axios.get(require("../config.json").url + "bill/listBills/50", {
      headers: { "x-auth-token": localStorage.getItem("token") },
    });
    bills = bills.data.bills;
    this.setState({ bills });
    this.props.store.dispatch(setData({ bills }));
  };
  getPending = async (e) => {
    e.preventDefault();
    var bills = await axios.get(require("../config.json").url + "bill/pendingBills", {
      headers: { "x-auth-token": localStorage.getItem("token") },
    });
    bills = bills.data.bills;
    this.setState({ bills });
    this.props.store.dispatch(setData({ bills }));
  };
  componentDidMount() {
    this.getBills();
  }
  render() {
    return (
      <div>
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
                <tr>
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
