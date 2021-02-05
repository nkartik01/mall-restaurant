import axios from "axios";
import React, { Component, Fragment } from "react";
import PermissionsSetup from "./PermissionsSetup";

export default class OperatorEdit extends Component {
  state = {
    username: "",
    name: "",
    balance: 0,
    transactions: [],
    restaurant: {},
    wait: {},
    edit: false,
    changeMenu: false,
  };
  getOperator = async (e) => {
    var res = await axios.get(require("../config.json").url + "operator/getOperator/" + this.props.match.params.username, {
      headers: { "x-auth-token": localStorage.getItem("token") },
    });
    res = res.data;
    if (!res.transactions) res.transactions = [];
    this.setState({
      username: res.username,
      name: res.name,
      balance: res.balance,
      restaurant: res.permissions.restaurant,
      wait: res.permissions.wait,
      edit: res.permissions.edit,
      changeMenu: res.permissions.changeMenu,
      transactions: res.transactions,
    });
    console.log(this.state);
  };
  setState1 = (arr) => {
    this.setState({ [arr[0]]: arr[1] });
  };
  onChange = (e) => {
    e.preventDefault();
    this.setState({ [e.target.name]: e.target.value });
  };
  onSubmit = async (e) => {
    e.preventDefault();
    try {
      var { name, balance, username, restaurant, wait, edit, changeMenu } = this.state;
      var data = {
        balance,
        name,
        username,
        permissions: { restaurant, wait, edit, changeMenu },
      };
      await axios.post(require("../config.json").url + "operator/edit", data, {
        headers: { "x-auth-token": localStorage.getItem("token") },
      });
      alert("Operator edited successfully");
    } catch (err) {
      alert("some error occured");
    }
  };
  componentDidMount() {
    this.getOperator();
  }
  render() {
    return (
      <Fragment>
        <div className="col-md-12" style={{ textAlign: "center" }}>
          {localStorage.getItem("status") === "admin" ? (
            <form className="form-control" onSubmit={(e) => this.onSubmit(e)}>
              <div className="from-group">
                <input className="form-control" placeholder="Name" type="text" id="name" name="name" value={this.state.name} onChange={(e) => this.onChange(e)} />
              </div>
              <div className="from-group">
                <input className="form-control" placeholder="Username" type="text" id="username" name="username" value={this.state.username} onChange={(e) => this.onChange(e)} />
              </div>
              <div className="from-group">
                <input className="form-control" placeholder="Balance" type="number" id="balance" name="balance" value={this.state.balance} onChange={(e) => this.onChange(e)} />
              </div>
              :
              <PermissionsSetup restaurant={this.state.restaurant} wait={this.state.wait} edit={this.state.edit} changeMenu={this.state.changeMenu} setState1={this.setState1} />
              <input type="Submit" value="Submit" className="form-control btn-primary" />
            </form>
          ) : (
            <Fragment>
              <table className="table table-bordered">
                <tbody>
                  <tr>
                    <th scope="row">Name</th>
                    <td>{this.state.name}</td>
                  </tr>
                  <tr>
                    <th scope="row">Username</th>
                    <td>{this.state.username}</td>
                  </tr>
                  <tr>
                    <th scope="row">Balance</th>
                    <td>{this.state.balance}</td>
                  </tr>
                </tbody>
              </table>
            </Fragment>
          )}
        </div>
        <div>
          <table className="table table-bordered">
            <thead>
              <tr>
                <th scope="col">Sr.</th>
                <th scope="col">Transaction Id</th>
                <th scope="col">Amount</th>
                <th scope="col">Transaction Type</th>
                <th scope="col">Bill Id</th>
                <th scope="col">Time</th>
              </tr>
            </thead>
            <tbody>
              {this.state.transactions.map((tran, i) => {
                return (
                  <tr>
                    <td>{i + 1}</td>
                    <td>{tran.tranId}</td>
                    <td>{tran.amount}</td>
                    <td>{tran.type}</td>
                    <td>{tran.bill}</td>
                    <td>{new Date(tran.at).toLocaleString("en-GB")}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Fragment>
    );
  }
}
