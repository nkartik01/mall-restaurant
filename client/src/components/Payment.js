import React, { Component, Fragment } from "react";
import axios from "axios";
import AlertDiv from "../AlertDiv";
export default class Payment extends Component {
  state = { partial: false, partialAmount: 0, upiId: "", cardId: "", discType: "none", discReason: "By operator" };
  getBill = async () => {
    try {
      var bill = await axios.get(require("../config.json").url + "bill/getBill/" + this.props.bill, {
        headers: { "x-auth-token": localStorage.getItem("token") },
      });
      bill = bill.data;
      this.setState({ bill });
      if (bill.discType && bill.discType !== "none") {
        this.setState({ discType: bill.discType, discAmount: bill.discAmount, discPerc: bill.discPerc });
      }
    } catch (err) {
      console.log(err, err.response);
    }
  };
  componentDidMount() {
    this.getBill();
  }
  render() {
    // this.setState
    return (
      <div>
        <form
          onSubmit={async (e) => {
            console.log(this.props.table);
            e.preventDefault();
            await axios.post(
              require("../config.json").url + "bill/addDiscount",
              {
                bill: this.props.bill,
                discType: this.state.discType,
                discAmount: Math.round(this.state.discAmount),
                discReason: this.state.discReason,
                table: this.props.table,
              },
              { headers: { "x-auth-token": localStorage.getItem("token") } }
            );

            this.props.afterDisc();
            AlertDiv("green", "Discount Applied");
            this.getBill();
          }}
        >
          <table align="center" className="table table-bordered">
            <tbody>
              <tr>
                <td>
                  <label htmlFor="discType">Discount type</label>
                </td>
                <td>
                  <select
                    id="discType"
                    value={this.state.discType}
                    required
                    onChange={(e) => {
                      e.preventDefault();
                      this.setState({ discType: e.target.value });
                    }}
                  >
                    <option value="none">none</option>
                    <option value="membership">membership</option>
                    <option value="regularCustomer">Regular Customer</option>
                    <option value="bulk order">Bulk Order</option>
                  </select>
                </td>
              </tr>
            </tbody>
          </table>
          <table align="center" className="table table-bordered">
            <tbody>
              {this.state.discType !== "none" ? (
                <Fragment>
                  <tr>
                    <td>
                      <label htmlFor="discPerc">Discount percentage</label>
                    </td>
                    <td>
                      <input
                        className="form-control"
                        type="number"
                        id="discPerc"
                        value={this.state.discPerc}
                        required
                        autoComplete="off"
                        onChange={(e) => {
                          e.preventDefault();
                          this.setState({ discPerc: e.target.value, discAmount: (e.target.value * this.props.orderHistory.sum) / 100 });
                        }}
                      />
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <label htmlFor="discAmount">Discount Amount</label>
                    </td>
                    <td>
                      <input
                        step={0.1}
                        className="form-control"
                        type="number"
                        id="discAmount"
                        value={this.state.discAmount}
                        required
                        autoComplete="off"
                        onChange={(e) => {
                          e.preventDefault();
                          this.setState({ discPerc: (e.target.value * 100) / this.props.orderHistory.sum, discAmount: e.target.value });
                        }}
                      />
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <label htmlFor="discReason">Reason</label>
                    </td>
                    <td>
                      <input
                        className="form-control"
                        type="text"
                        id="discReason"
                        value={this.state.discReason}
                        onChange={async (e) => {
                          e.preventDefault();
                          this.setState({ discReason: e.target.value });
                        }}
                      />
                    </td>
                  </tr>
                  <tr>
                    <td colSpan={2}>
                      <input type="submit" value="Apply Discount" className="btn-secondary" />
                    </td>
                  </tr>
                </Fragment>
              ) : null}
            </tbody>
          </table>
        </form>
        <form id="partialForm" onSubmit={(e) => e.preventDefault()}>
          <table align="center" className="table table-bordered">
            <tbody>
              <tr>
                <td>
                  <label className="switch">
                    <input
                      type="checkbox"
                      id="partial"
                      disabled={this.props.disable}
                      // disabled={this.props.table.orderChange.sum !== 0 || this.props.table.orderHistory.sum === 0 ? true : false}
                      value={this.state.partial}
                      onChange={(e) => {
                        this.setState({ partial: e.target.checked });
                      }}
                    />
                    <span className="slider round"></span>
                  </label>
                </td>
                <td>
                  <label htmlFor="partial">Partial Payment?</label>
                </td>
              </tr>
              <tr>
                <td colSpan={2}>
                  <input
                    className="form-control"
                    type="number"
                    id="partialAmount"
                    max={this.props.amount}
                    min={1}
                    required
                    placeholder="Partial Amount"
                    value={this.state.partialAmount}
                    onChange={(e) => {
                      e.preventDefault();
                      var value = e.target.value === "" ? 0 : parseInt(e.target.value);
                      this.setState({ partialAmount: value });
                    }}
                    hidden={!this.state.partial || this.props.disable ? true : false}
                    disabled={!this.state.partial || this.props.disable ? true : false}
                  />
                </td>
              </tr>
              <tr>
                <td colSpan={2}>
                  <input
                    className="form-control"
                    disabled={!this.state.partial || this.props.disable ? true : false}
                    type="text"
                    required
                    placeholder="Partial privalage given to"
                    id="to"
                    name="to"
                    value={this.state.to}
                    onChange={(e) => {
                      e.preventDefault();
                      this.setState({ to: e.target.value });
                    }}
                    hidden={!this.state.partial || this.props.disable ? true : false}
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </form>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            try {
              // console.log()
              var tranAmount = parseInt(this.state.partial ? parseInt(this.state.partialAmount) : parseInt(this.props.amount));
              if (!window.confirm("Are you sure you want to deduct Rs." + tranAmount + " from this card?")) return;
              await axios.post(
                require("../config.json").url + "card/deductAmount",
                {
                  // amount: this.props.table.partial ? partAmont) : this.props.table.orderHistory.sum,

                  amount: tranAmount,
                  to: this.state.partial ? this.state.to : undefined,
                  uid: this.state.uid,
                  bill: this.props.bill,
                  table: !this.props.table ? false : this.props.table,
                },
                { headers: { "x-auth-token": localStorage.getItem("token") } }
              );
              AlertDiv("green", "Paid");
              try {
                await axios.post(
                  require("../config.json").url + "bill/printBill",
                  {
                    restaurant: this.props.restaurant,
                    bill: this.props.bill,
                    balance: this.props.amount,
                    orderHistory: this.props.orderHistory,
                    paid: tranAmount,
                    printer: localStorage.getItem("printer"),
                    method: "rfid",
                    uid: this.state.uid,
                  },
                  { headers: { "x-auth-token": localStorage.getItem("token") } }
                );
              } catch (err) {
                console.log(err);
                AlertDiv("red", "Couldn't Print Bill");
              }
              document.getElementById("partial").checked = false;
              this.setState({ partial: false, partialAmount: 0, uid: "" });

              if (!!this.props.callBack) {
                this.props.callBack(tranAmount);
              }
            } catch (err) {
              if (!!this.props.fallBack) {
                this.props.fallBack();
              }
              this.setState({ uid: "" });
              console.log(err, err.response);
              AlertDiv("red", "Couldn't Deduct Money, " + err.response.data);
            }
          }}
        >
          <table align="center" className="table table-bordered">
            <tbody>
              <tr>
                <td>
                  <input
                    className="form-control"
                    placeholder="UID"
                    type="text"
                    id="uid"
                    value={this.state.uid}
                    autoFocus
                    autoComplete="off"
                    onChange={(e) => {
                      e.preventDefault();
                      this.setState({ uid: e.target.value });
                    }}
                    required
                    disabled={this.props.disable}
                  />
                </td>
                <td>
                  <input className="form-control" type="submit" value="Pay by Card" disabled={this.props.disable} />
                </td>
              </tr>
            </tbody>
          </table>
        </form>
        <form
          id="cashForm"
          onSubmit={async (e) => {
            e.preventDefault();

            try {
              // console.log()
              var tranAmount = parseInt(this.state.partial ? parseInt(this.state.partialAmount) : parseInt(this.props.amount));
              var received = parseInt(prompt("Cash Tendered by Customer"));
              if (!received || received === 0) return;
              alert("Return Rs. " + received + " - " + tranAmount + " = " + (received - tranAmount));
              if (!window.confirm("Are you sure you received Rs." + tranAmount + " for this order in Cash?")) return;
              await axios.post(
                require("../config.json").url + "bill/byCash",
                {
                  // amount: this.props.table.partial ? partAmont) : this.props.table.orderHistory.sum,

                  amount: tranAmount,
                  to: this.state.partial ? this.state.to : undefined,
                  bill: this.props.bill,
                  table: !this.props.table ? false : this.props.table,
                },
                { headers: { "x-auth-token": localStorage.getItem("token") } }
              );
              document.getElementById("partial").checked = false;
              this.setState({ partial: false, partialAmount: 0, uid: "" });
              AlertDiv("yellow", "Paid");
              try {
                await axios.post(
                  require("../config.json").url + "bill/printBill",
                  {
                    restaurant: this.props.restaurant,
                    bill: this.props.bill,
                    balance: this.props.amount,
                    orderHistory: this.props.orderHistory,
                    paid: tranAmount,
                    printer: localStorage.getItem("printer"),
                    method: "cash",
                  },
                  { headers: { "x-auth-token": localStorage.getItem("token") } }
                );
              } catch (err) {
                console.log(err);
                AlertDiv("red", "Couldn't Print Bill");
              }
              if (!!this.props.callBack) {
                this.props.callBack(tranAmount);
              }
            } catch (err) {
              if (!!this.props.fallBack) {
                this.props.fallBack();
              }
              this.setState({ uid: "" });
              console.log(err, err.response);
              AlertDiv("red", "Couldn't Deduct Money, " + err.response.data);
            }
          }}
        >
          <table align="center" className="table table-bordered">
            <tbody>
              <tr>
                <td colSpan={2}>
                  <input className="form-control" type="submit" value="Receive Cash" disabled={this.props.disable} />
                </td>
              </tr>
            </tbody>
          </table>
        </form>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            try {
              // console.log()
              var tranAmount = parseInt(this.state.partial ? parseInt(this.state.partialAmount) : parseInt(this.props.amount));
              if (!window.confirm("Are you sure you received Rs." + tranAmount + " for this order in UPI transaction?")) return;
              await axios.post(
                require("../config.json").url + "bill/byUpi",
                {
                  // amount: this.props.table.partial ? partAmont) : this.props.table.orderHistory.sum,
                  tranId: this.state.upiId,
                  amount: tranAmount,
                  to: this.state.partial ? this.state.to : undefined,
                  bill: this.props.bill,
                  table: !this.props.table ? false : this.props.table,
                },
                { headers: { "x-auth-token": localStorage.getItem("token") } }
              );
              document.getElementById("partial").checked = false;
              this.setState({ partial: false, partialAmount: 0, uid: "" });
              AlertDiv("green", "Paid");
              try {
                await axios.post(
                  require("../config.json").url + "bill/printBill",
                  {
                    restaurant: this.props.restaurant,
                    bill: this.props.bill,
                    balance: this.props.amount,
                    orderHistory: this.props.orderHistory,
                    paid: tranAmount,
                    printer: localStorage.getItem("printer"),
                    method: "upi",
                    tranId: this.state.upiId,
                  },
                  { headers: { "x-auth-token": localStorage.getItem("token") } }
                );
              } catch (err) {
                console.log(err);
                AlertDiv("red", "Couldn't print bill");
              }
              if (!!this.props.callBack) {
                this.props.callBack(tranAmount);
              }
            } catch (err) {
              if (!!this.props.fallBack) {
                this.props.fallBack();
              }
              this.setState({ uid: "", cardId: "", upiId: "", partial: false });
              console.log(err, err.response);
              AlertDiv("red", "Couldn't Deduct Money, " + err.response.data);
            }
          }}
        >
          <table align="center" className="table table-bordered">
            <tbody>
              <tr>
                <td>
                  <input
                    className="form-control"
                    type="text"
                    name="upiId"
                    value={this.state.upiId}
                    id="upiId"
                    onChange={(e) => {
                      e.preventDefault();
                      this.setState({ upiId: e.target.value });
                    }}
                    placeholder="Enter UPI transaction ID"
                    required
                    autoComplete="off"
                    disabled={this.props.disable}
                  />
                </td>
                <td>
                  <input className="form-control" type="submit" value="received UPI Payment" disabled={this.props.disable} />
                </td>
              </tr>
            </tbody>
          </table>
        </form>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            try {
              // console.log()
              var tranAmount = parseInt(this.state.partial ? parseInt(this.state.partialAmount) : parseInt(this.props.amount));
              if (!window.confirm("Are you sure you received Rs." + tranAmount + " for this order in Card Swipe transaction?")) return;
              await axios.post(
                require("../config.json").url + "bill/byCard",
                {
                  // amount: this.props.table.partial ? partAmont) : this.props.table.orderHistory.sum,
                  tranId: this.state.cardId,
                  amount: tranAmount,
                  to: this.state.partial ? this.state.to : undefined,
                  bill: this.props.bill,
                  table: !this.props.table ? false : this.props.table,
                },
                { headers: { "x-auth-token": localStorage.getItem("token") } }
              );
              document.getElementById("partial").checked = false;
              this.setState({ partial: false, partialAmount: 0, uid: "" });
              AlertDiv("green", "Paid");
              try {
                await axios.post(
                  require("../config.json").url + "bill/printBill",
                  {
                    restaurant: this.props.restaurant,
                    bill: this.props.bill,
                    balance: this.props.amount,
                    orderHistory: this.props.orderHistory,
                    paid: tranAmount,
                    printer: localStorage.getItem("printer"),
                    method: "cardSwipe",
                    tranId: this.state.cardId,
                  },
                  { headers: { "x-auth-token": localStorage.getItem("token") } }
                );
              } catch (err) {
                console.log(err);
                AlertDiv("red", "Couldn't print bill");
              }
              if (!!this.props.callBack) {
                this.props.callBack(tranAmount);
              }
            } catch (err) {
              if (!!this.props.fallBack) {
                this.props.fallBack();
              }
              this.setState({ uid: "", cardId: "", upiId: "", partial: false });
              console.log(err, err.response);
              AlertDiv("red", "Couldn't Deduct Money, " + err.response.data);
            }
          }}
        >
          <table align="center" className="table table-bordered">
            <tbody>
              <tr>
                <td>
                  <input
                    className="form-control"
                    type="text"
                    name="cardId"
                    value={this.state.cardId}
                    id="cardId"
                    disabled={this.props.disable}
                    onChange={(e) => {
                      e.preventDefault();
                      this.setState({ cardId: e.target.value });
                    }}
                    placeholder="Enter card transaction ID"
                    required
                    autoComplete="off"
                  />
                </td>
                <td>
                  <input className="form-control" type="submit" value="received card Payment" disabled={this.props.disable} />
                </td>
              </tr>
            </tbody>
          </table>
        </form>
        <table align="center" className="table table-bordered">
          <tbody>
            <tr>
              <td colSpan={2}>
                <button
                  className="btn  btn-primary"
                  onClick={async (e) => {
                    e.preventDefault();
                    await axios.post(
                      require("../config.json").url + "bill/printBill",
                      {
                        restaurant: this.props.restaurant,
                        bill: this.props.bill,
                        balance: this.props.amount,
                        orderHistory: this.props.orderHistory,
                        // paid: this.props.tranAmount,
                        preview: true,
                        printer: localStorage.getItem("printer"),
                      },
                      { headers: { "x-auth-token": localStorage.getItem("token") } }
                    );
                  }}
                >
                  Print Bill Preview
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }
}
