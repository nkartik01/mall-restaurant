import axios from "axios";
import React, { Component, Fragment } from "react";
import { withRouter } from "react-router-dom";
import AlertDiv from "../AlertDiv";
import { setData } from "../redux/action/loadedData";

export default withRouter(
  class ManipulateRFID extends Component {
    state = { uid: "", card: {}, cards: [] };
    getCard = async (e) => {
      try {
        e.preventDefault();
        var res = await axios.get("http://" + require("../config.json").ip + ":5001/mall-restraunt/us-central1/api/card/getCard/" + this.state.uid, {
          headers: { "x-auth-token": localStorage.getItem("token") },
        });
        res = res.data;
        this.setState({ card: res.card, cards: [] });
      } catch (err) {
        console.log(err, err.response);
        AlertDiv("red", "Error, " + err.response.data);
        this.setState({ uid: "" });
      }
    };
    onChange = (e) => {
      console.log(this.props);
      this.props.store.dispatch(setData({ hi: "bye" }));
      e.preventDefault();
      this.setState({ [e.target.id]: e.target.value });
    };
    assign = async (e) => {
      e.preventDefault();
      try {
        await axios.post(
          "http://" + require("../config.json").ip + ":5001/mall-restraunt/us-central1/api/card/assign",
          {
            uid: this.state.uid,
            holder: this.state.card.holder,
            balance: this.state.card.balance,
          },
          { headers: { "x-auth-token": localStorage.getItem("token") } }
        );
        AlertDiv("green", "Card assigned successfully");
        this.setState({ card: {}, uid: "" });
      } catch (err) {
        console.log(err, err.response);
        AlertDiv("red", err.response ? err.response.data : "Failed to assign Card");
      }
    };
    retire = async (e) => {
      e.preventDefault();
      try {
        await axios.post(
          "http://" + require("../config.json").ip + ":5001/mall-restraunt/us-central1/api/card/retire",
          { uid: this.state.uid },
          { headers: { "x-auth-token": localStorage.getItem("token") } }
        );
        AlertDiv("green", "Retired Successfully");
        this.setState({ card: {}, uid: "" });
      } catch (err) {
        console.log(err, err.response);
        AlertDiv("red", err.response ? err.response.data : "Could Not retire card properly");
      }
    };
    render() {
      var card = this.state.card;
      return (
        <div>
          {Object.keys(this.state.card).length === 0 ? (
            <Fragment>
              <form onSubmit={(e) => this.getCard(e)}>
                <div className="form-group">
                  <input
                    autoFocus
                    type="text"
                    required
                    name={"uid"}
                    placeholder="uid"
                    id="uid"
                    autoComplete="off"
                    value={this.state.uid}
                    onChange={(e) => this.onChange(e)}
                    className="form-control"
                  />
                </div>
                <input type="submit" value="Submit" className="btn btn-primary" />
              </form>
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  var res = await axios.get("http://" + require("../config.json").ip + ":5001/mall-restraunt/us-central1/api/card/searchByPhone/" + this.state.phone, {
                    headers: { "x-auth-token": localStorage.getItem("token") },
                  });
                  res = res.data;
                  if (res.cards.length === 0) AlertDiv("red", "No Cards Found");
                  else this.setState({ card: {}, uid: "", cards: res.cards });
                }}
              >
                <div className="form-group">
                  <input
                    autoComplete="off"
                    type="number"
                    required
                    name="phone"
                    placeholder="Phone Number"
                    id="phone"
                    value={this.state.phone}
                    onChange={(e) => this.onChange(e)}
                    className="form-control"
                  />
                </div>
                <input type="submit" value="Search" className="btn btn-primary" />
              </form>
            </Fragment>
          ) : (
            <Fragment>
              <center>
                <h3>UID: {this.state.uid}</h3>
              </center>
              <br />
              <form onSubmit={(e) => this.assign(e)}>
                <table className="table table-bordered">
                  <tbody>
                    <tr>
                      <th scope="row">Holder Name</th>
                      <td>
                        {card.holder.assigned ? (
                          card.holder.name
                        ) : (
                          <input
                            required
                            autoFocus
                            type="text"
                            name={"holderName"}
                            value={card.holder.name}
                            onChange={(e) => {
                              e.preventDefault();
                              card.holder.name = e.target.value;
                              this.setState({ card });
                            }}
                          />
                        )}
                      </td>
                    </tr>
                    <tr>
                      <th scope="row">Holder mobile number</th>
                      <td>
                        {card.holder.assigned ? (
                          card.holder.mobile
                        ) : (
                          <input
                            required
                            type="text"
                            name={"holderMobile"}
                            value={card.holder.mobile}
                            onChange={(e) => {
                              e.preventDefault();
                              card.holder.mobile = e.target.value;
                              this.setState({ card });
                            }}
                          />
                        )}
                      </td>
                    </tr>
                    <tr>
                      <th scope="row">Balance</th>
                      <td>
                        {card.holder.assigned ? (
                          <Fragment>{card.balance}</Fragment>
                        ) : (
                          <input
                            required
                            type="number"
                            name={"holderbalance"}
                            value={card.holder.balance}
                            onChange={(e) => {
                              e.preventDefault();
                              card.balance = e.target.value;
                              this.setState({ card });
                            }}
                          />
                        )}
                      </td>
                    </tr>
                  </tbody>
                </table>
                {card.holder.assigned ? (
                  <button className="btn btn-primary" onClick={(e) => this.retire(e)}>
                    Retire
                  </button>
                ) : (
                  <input type="submit" value="Assign" className="btn btn-primary" />
                )}
              </form>
              {card.holder.assigned ? (
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    console.log(e.target);
                    var res = await axios.post(
                      "http://" + require("../config.json").ip + ":5001/mall-restraunt/us-central1/api/card/addAmount",
                      { amount: this.state.toAdd, uid: this.state.uid },
                      { headers: { "x-auth-token": localStorage.getItem("token") } }
                    );
                    console.log(res.data);
                    AlertDiv("green", "Amount Added");
                    this.getCard(e);
                  }}
                >
                  <input
                    type="number"
                    min={0}
                    required
                    value={this.state.toAdd}
                    onChange={(e) => {
                      e.preventDefault();
                      this.setState({ toAdd: parseInt(e.target.value) });
                    }}
                    id="toAdd"
                    name="toAdd"
                    placeholder="Amount to add"
                    className="form-control"
                  />
                  <input type="submit" value="Add money to card" className="btn btn-primary" />
                </form>
              ) : null}
              <button
                className="btn btn-primary"
                onClick={(e) => {
                  e.preventDefault();
                  this.setState({ uid: "", card: {} });
                }}
              >
                Clear
              </button>
              <table className="table table-borders">
                <thead>
                  <tr>
                    <th scope="col">Time</th>
                    <th scope="col">Type</th>
                    <th scope="col">By</th>
                    <th scope="col">Details</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {card.transactions
                    .filter((tran, id) => {
                      if (id > 5) return false;
                      return true;
                    })
                    .map((tran, id) => {
                      return (
                        <tr>
                          <td>{new Date(parseInt(tran.at)).toLocaleString("en-GB")}</td>
                          <td>{tran.type}</td>
                          <td>{tran.by}</td>
                          <td>{JSON.stringify(tran.details)}</td>
                          <td>
                            {tran.type === "deduction" ? (
                              <button
                                className="btn btn-primary"
                                onClick={(e) => {
                                  e.preventDefault();
                                  console.log(this.props.history.push("/bill/" + tran.details.bill));
                                }}
                              >
                                Check Bill
                              </button>
                            ) : null}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </Fragment>
          )}
          {this.state.cards.length !== 0 ? (
            <Fragment>
              <table className="table table-bordered">
                <thead>
                  <tr>
                    <th>Card Number</th>
                    <th>Holder Name</th>
                    <th>Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {this.state.cards.map((card, _) => {
                    return (
                      <tr
                        onClick={(e) => {
                          this.state.uid = card.id;
                          this.state.phone = "";
                          this.getCard(e);
                        }}
                      >
                        <td>{card.uid}</td>
                        <td> {card.holder.name} </td>
                        <td>{card.balance}</td>
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
);
