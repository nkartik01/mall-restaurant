import axios from "axios";
import React, { Component } from "react";
import { Link } from "react-router-dom";

export default class ListChef extends Component {
  state = { chefs: [] };
  getChefs = async () => {
    var res = await axios.get(
      localStorage.getItem("apiUrl") + "chef/getChefList",
      {
        headers: { "x-auth-token": localStorage.getItem("token") },
      }
    );
    res = res.data;
    this.setState({ chefs: res.chefs });
    console.log(this.state.chef);
  };
  componentDidMount() {
    this.getChefs();
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
          {this.state.chefs.map((chef, index) => {
            return (
              <tr>
                <th scope="row">{index + 1}</th>
                <td>{chef.name}</td>
                <td>{chef.username}</td>
                <td>
                  <Link
                    className="btn btn-primary"
                    to={"/chef/" + chef.username}
                  >
                    Edit Chef
                  </Link>
                </td>
              </tr>
            );
          })}
        </table>
      </div>
    );
  }
}
