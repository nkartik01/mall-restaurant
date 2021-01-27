import axios from "axios";
import React, { Component } from "react";
import { Link } from "react-router-dom";
import { setData } from "../redux/action/loadedData";

export default class BillList extends Component {
  state = { bills: this.props.store.getState().loadedDataReducer.bills ? this.props.store.getState().loadedDataReducer.bills : [] };
  getBills = async () => {
    var bills = await axios.get("http://192.168.1.178:5001/mall-restraunt/us-central1/api/bill/listBills/50", { headers: { "x-auth-token": localStorage.getItem("token") } });
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
        <table className="table table-bordered">
          <thead>
            <tr>
              <th>Sr. No.</th>
              <th>Bill Id</th>
              <th>Balance</th>
              <th>Generated At</th>
              <th>Go to bill</th>
            </tr>
          </thead>
          <tbody>
            {this.state.bills.map((bill, ind) => {
              return (
                <tr>
                  <td>{ind + 1}</td>
                  <td>{bill.id}</td>
                  <td>{bill.balance}</td>
                  <td>{bill.at}</td>
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
