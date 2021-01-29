import axios from "axios";
import React, { Component } from "react";

export default class ListOperators extends Component {
  state = { operators: [] };
  getOperators = async () => {
    var res = await axios.get("http://192.168.2.171:5001/mall-restraunt/us-central1/api/operator/getOperatorList", {
      headers: { "x-auth-token": localStorage.getItem("token") },
    });
    res = res.data;
    this.setState({ operators: res.operators });
    console.log(this.state.operator);
  };
  componentDidMount() {
    this.getOperators();
  }
  render() {
    return (
      <div>
        <table className="table table-bordered">
          <tr>
            <th scopw="col"></th>
            <th scope="col">Name</th>
            <th scope="col">Username</th>
          </tr>
          {this.state.operators.map((operator, index) => {
            return (
              <tr>
                <th scope="row">{index + 1}</th>
                <td>{operator.name}</td>
                <td>{operator.username}</td>
                <td>
                  <button
                    type="button"
                    className="btn"
                    style={{ backgroundColor: "blue", color: "white" }}
                    onClick={(e) => {
                      e.preventDefault();
                      window.open("/#/operatorEdit/" + operator.username);
                    }}
                  >
                    Edit Operator
                  </button>
                </td>
              </tr>
            );
          })}
        </table>
      </div>
    );
  }
}
