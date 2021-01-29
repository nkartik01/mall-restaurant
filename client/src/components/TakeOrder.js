import axios from "axios";
import React, { Component, Fragment } from "react";
import { Tabs, Tab, Row, Col, Nav } from "react-bootstrap";
import { setData } from "../redux/action/loadedData";
import Payment from "./Payment";

export default class TakeOrder extends Component {
  state = {
    isLoading: this.props.store.getState().loadedDataReducer.hi === "hi" ? false : true,
    menus: {},
    partial: false,
    ...this.props.store.getState().loadedDataReducer,
  };
  setState1 = (x) => {
    this.setState(x);
  };
  getRestaurants = async () => {
    var res = await axios.get("http://192.168.2.171:5001/mall-restraunt/us-central1/api/operator/getPermissions", {
      headers: { "x-auth-token": localStorage.getItem("token") },
    });
    res = res.data;
    this.setState({ permissions: res.permissions });
    res = await axios.get("http://192.168.2.171:5001/mall-restraunt/us-central1/api/menu/getRestaurantMenus", {
      headers: { "x-auth-token": localStorage.getItem("token") },
    });
    res = res.data;
    this.setState({ menus: res.menus });
    res = await axios.get("http://192.168.2.171:5001/mall-restraunt/us-central1/api/menu/getTables", {
      headers: { "x-auth-token": localStorage.getItem("token") },
    });
    res = res.data;
    console.log(res.tables, this.state.tables);
    res.tables.map((table, i) => {
      if (this.state.tables) {
        res.tables[i].orderChange = this.state.tables[i].orderChange;
        console.log(this.state.tables[i]);
        this.state.tables[i].orderChange.order.map((order, ind) => {
          var c = 0;
          for (var j = 0; j < table.orderHistory.order.length; j++) {
            if (order.item === table.orderHistory.order[j].item) {
              res.tables[i].orderHistory.order[j].quantity = res.tables[i].orderHistory.order[j].quantity + order.quantity;
              c = 1;
              break;
            }
          }
          if (c === 0) {
            res.tables[i].orderHistory.order.push(order);
          }
          return null;
        });
        res.tables[i].orderHistory.sum = res.tables[i].orderHistory.sum + this.state.tables[i].orderChange.sum;
      } else res.tables[i].orderChange = { order: [], sum: 0 };
      return null;
    });
    this.setState({ tables: res.tables, isLoading: false });
    this.setRedux();
  };
  setRedux = () => {
    this.props.store.dispatch(setData({ tables: this.state.tables, menus: this.state.menus, permissions: this.state.permissions, hi: "hi" }));
  };
  componentDidMount() {
    this.getRestaurants();
    // this.interval = setInterval(() => this.getRestaurants(), 10000);
  }
  componentWillUnmount() {
    // clearInterval(this.interval);
  }
  render() {
    var rests = Object.keys(this.state.menus);
    return (
      <div style={{ height: "100%" }}>
        {!this.state.isLoading ? (
          <Tabs id="uncontrolled-tab-example" style={{ backgroundColor: "red" }} defaultActiveKey="null">
            <Tab eventKey="null" title="Welcome">
              <p>Select Restraunt and proceed</p>

              <button
                onClick={(e) => {
                  e.preventDefault();
                }}
                className="btn btn-primary"
              >
                Refresh Status
              </button>
            </Tab>

            {/* Restraunts */}

            {rests.map((rest, ind) => {
              var categories = Object.keys(this.state.menus[rest]);
              var tables = this.state.tables.filter((elem, x) => {
                if (elem.restaurant === rest) {
                  return true;
                }
                return false;
              });
              return (
                <Tab eventKey={rest} title={rest} disabled={!this.state.permissions.wait[rest] ? true : false} style={{ fontWeight: "bold" }}>
                  <Tab.Container id="left-tabs-example" defaultActiveKey="table-0">
                    <Row>
                      {/* Tables */}
                      <Col sm={2} style={{ maxHeight: "100%" }}>
                        <Nav variant="pills" className="flex-column">
                          {tables.map((table, i) => {
                            var status = table.orderHistory.sum === 0 ? "free" : "occupied";
                            return (
                              <Nav.Item>
                                <Nav.Link className={"activeColor " + status} eventKey={"table-" + i}>
                                  {table.table}
                                </Nav.Link>
                              </Nav.Item>
                            );
                          })}
                        </Nav>
                      </Col>
                      <Col sm={10}>
                        <Tab.Content>
                          {/* menu categories */}

                          {tables.map((table, ii) => {
                            return (
                              <Tab.Pane eventKey={"table-" + ii} id="left-tabs-example">
                                <Tab.Container id="left-tabs-example" defaultActiveKey="category-0">
                                  <Row>
                                    <Col sm={2} style={{ border: "1px solid black" }}>
                                      <h3 style={{ backgroundColor: "red", color: "white" }}>Ordering for {table.table}</h3>
                                      <Nav varient="pills" className="flex-column">
                                        {categories.map((category, i2) => {
                                          return (
                                            <Nav.Item>
                                              <Nav.Link className={"activeColor"} style={{ borderBottom: "1px solid black" }} eventKey={"category-" + i2}>
                                                {category}
                                              </Nav.Link>
                                            </Nav.Item>
                                          );
                                        })}
                                      </Nav>
                                    </Col>
                                    <Col sm={6} style={{ border: "1px solid black" }}>
                                      <Tab.Content>
                                        {categories.map((category, i2) => {
                                          return (
                                            <Tab.Pane eventKey={"category-" + i2} title={category}>
                                              <div className="row">
                                                {this.state.menus[rest][category].map((item, iii) => {
                                                  return (
                                                    <div
                                                      style={{ backgroundColor: "yellow", border: "1px dotted black" }}
                                                      className="card col-md-3"
                                                      id={table.table + "-" + item.name + "-" + item.price + "-" + localStorage.getItem("username")}
                                                      onClick={(e) => {
                                                        e.preventDefault();
                                                        if (!tables[ii].orderChange) {
                                                          tables[ii].orderChange = { order: [], sum: 0 };
                                                        }
                                                        var tabind = -1;
                                                        for (var i3 = 0; i3 < tables[ii].orderChange.order.length; i3++) {
                                                          if (tables[ii].orderChange.order[i3].item === item.name) {
                                                            tabind = 1;
                                                            tables[ii].orderChange.order[i3].quantity = tables[ii].orderChange.order[i3].quantity + 1;
                                                            break;
                                                          }
                                                        }
                                                        if (tabind !== 1) {
                                                          tables[ii].orderChange.order.push({
                                                            item: item.name,
                                                            category,
                                                            price: parseInt(item.price),
                                                            quantity: 1,
                                                          });
                                                        }
                                                        tabind = -1;
                                                        for (i3 = 0; i3 < tables[ii].orderHistory.order.length; i3++) {
                                                          if (tables[ii].orderHistory.order[i3].item === item.name) {
                                                            tabind = 1;
                                                            tables[ii].orderHistory.order[i3].quantity = tables[ii].orderHistory.order[i3].quantity + 1;
                                                            break;
                                                          }
                                                        }
                                                        if (tabind !== 1) {
                                                          tables[ii].orderHistory.order.push({
                                                            item: item.name,
                                                            category,
                                                            price: item.price,
                                                            quantity: 1,
                                                          });
                                                        }
                                                        tables[ii].orderHistory.sum = parseInt(tables[ii].orderHistory.sum) + parseInt(item.price);
                                                        tables[ii].orderChange.sum = parseInt(tables[ii].orderChange.sum) + parseInt(item.price);
                                                        this.setState({});
                                                      }}
                                                    >
                                                      <h4>{item.name}</h4>
                                                      <br />
                                                      {item.price}
                                                      <br />
                                                    </div>
                                                  );
                                                })}
                                              </div>
                                            </Tab.Pane>
                                          );
                                        })}
                                      </Tab.Content>
                                    </Col>
                                    <Col sm={4} style={{ border: "1px solid black" }}>
                                      {tables[ii].orderChange ? (
                                        <Fragment>
                                          <h3 style={{ backgroundColor: "blue", color: "white" }}>Running Order</h3>
                                          <br />
                                          <div>
                                            <table className="table table-bordered">
                                              <thead>
                                                <tr>
                                                  <th style={{ width: "10%" }} scope="col">
                                                    S no.
                                                  </th>
                                                  <th style={{ width: "40%" }} scope="col">
                                                    Item
                                                  </th>
                                                  <th style={{ width: "10%" }} scope="col">
                                                    Price
                                                  </th>
                                                  <th style={{ width: "20%" }} scope="col">
                                                    Quantity
                                                  </th>
                                                  <th style={{ width: "20%" }} scope="col">
                                                    Amount
                                                  </th>
                                                </tr>
                                              </thead>
                                              <tbody>
                                                {tables[ii].orderChange.order.map((item, i1) => {
                                                  return (
                                                    <tr>
                                                      <th scope="row">{i1 + 1}</th>
                                                      <td align="left">{item.item}</td>
                                                      <td> {item.price} </td>
                                                      <td>
                                                        <button
                                                          style={{ borderRadius: "100%" }}
                                                          onClick={() => {
                                                            console.log(tables[ii].orderHistory, tables[ii].orderChange);
                                                            console.log(tables[ii].orderChange.order[i1].quantity);
                                                            var x = tables[ii].orderChange.order[i1].quantity;
                                                            x = x - 1;
                                                            tables[ii].orderChange.order[i1].quantity = x;
                                                            console.log(tables[ii].orderChange);
                                                            if (tables[ii].orderChange.order[i1].quantity === 0) {
                                                              tables[ii].orderChange.order.splice(i1, 1);
                                                            }
                                                            tables[ii].orderChange.sum = parseInt(tables[ii].orderChange.sum) - parseInt(item.price);
                                                            tables[ii].orderHistory.sum = tables[ii].orderHistory.sum - parseInt(item.price);

                                                            console.log(tables[ii].orderHistory);
                                                            for (var i3 = 0; i3 < tables[ii].orderHistory.order.length; i3++) {
                                                              console.log(tables[ii].orderHistory, item.item);

                                                              if (tables[ii].orderHistory.order[i3].item === item.item) {
                                                                console.log("inside if");
                                                                tables[ii].orderHistory.order[i3].quantity = tables[ii].orderHistory.order[i3].quantity - 1;
                                                                if (tables[ii].orderHistory.order[i3].quantity === 0) {
                                                                  tables[ii].orderHistory.order.splice(i3, 1);
                                                                }
                                                                break;
                                                              }
                                                              console.log(tables[ii].orderHistory);
                                                            }
                                                            console.log(tables[ii].orderHistory);
                                                            this.setState({});
                                                            console.log(tables[ii].orderHistory);
                                                          }}
                                                        >
                                                          -
                                                        </button>
                                                        {" " + item.quantity + " "}
                                                        <button
                                                          style={{ borderRadius: "100%" }}
                                                          onClick={() => {
                                                            console.log(tables[ii].orderHistory);
                                                            tables[ii].orderChange.order[i1].quantity = tables[ii].orderChange.order[i1].quantity + 1;

                                                            tables[ii].orderChange.sum = tables[ii].orderChange.sum + parseInt(item.price);
                                                            tables[ii].orderHistory.sum = tables[ii].orderHistory.sum + parseInt(item.price);

                                                            console.log(tables[ii].orderHistory);
                                                            for (var i3 = 0; i3 < tables[ii].orderHistory.order.length; i3++) {
                                                              if (tables[ii].orderHistory.order[i3].item === item.item) {
                                                                tables[ii].orderHistory.order[i3].quantity = tables[ii].orderHistory.order[i3].quantity + 1;
                                                                break;
                                                              }
                                                            }
                                                            console.log(tables[ii].orderHistory.order[i3]);
                                                            this.setState({});
                                                            console.log(tables[ii].orderHistory.order[i3]);
                                                          }}
                                                        >
                                                          +
                                                        </button>
                                                      </td>

                                                      <td>{item.price * item.quantity}</td>
                                                    </tr>
                                                  );
                                                })}
                                                <tr>
                                                  <td />
                                                  <td />
                                                  <td />
                                                  <td />
                                                  <th>{tables[ii].orderChange.sum}</th>
                                                </tr>
                                              </tbody>
                                            </table>
                                            <button
                                              className="btn btn-primary"
                                              onClick={async (e) => {
                                                e.target.disabled = true;
                                                e.preventDefault();
                                                var res = await axios.post(
                                                  "http://192.168.2.171:5001/mall-restraunt/us-central1/api/menu/updateTable",
                                                  { orderHistory: tables[ii].orderHistory, orderChange: tables[ii].orderChange, table: tables[ii] },
                                                  { headers: { "x-auth-token": localStorage.getItem("token") } }
                                                );
                                                tables[ii].bill = res.data;
                                                tables[ii].orderChange.order = [];
                                                tables[ii].orderChange.sum = 0;
                                                e.target.disabled = false;
                                                this.setState({});
                                              }}
                                            >
                                              Add to Order
                                            </button>
                                          </div>
                                        </Fragment>
                                      ) : null}
                                      <table className="table table-bordered">
                                        <thead>
                                          <tr>
                                            <th scope="col">S No.</th>
                                            <th scope="col">Item</th>
                                            <th scope="col">Price</th>
                                            <th scope="col">Quantity</th>
                                            <th scope="col">Amount</th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {tables[ii].orderHistory.order.map((item, i1) => {
                                            return (
                                              <tr>
                                                <th scope="row">{i1 + 1}</th>
                                                <td>{item.item}</td>
                                                <td>{item.price}</td>
                                                <td>{item.quantity}</td>
                                                <td>{item.price * item.quantity}</td>
                                              </tr>
                                            );
                                          })}
                                          <tr>
                                            <td />
                                            <td />
                                            <td />
                                            <td />
                                            <th>{tables[ii].orderHistory.sum}</th>
                                          </tr>
                                        </tbody>
                                      </table>
                                      <h4>Balance: {tables[ii].balance ? tables[ii].balance : 0}</h4>
                                      <Payment
                                        amount={tables[ii].balance ? tables[ii].balance : 0}
                                        disable={tables[ii].orderChange.sum !== 0 || tables[ii].orderHistory.sum === 0 ? true : false}
                                        bill={tables[ii].bill}
                                        table={tables[ii].id}
                                        callBack={async (amount) => {
                                          console.log(amount);
                                          tables[ii].balance = tables[ii].balance - amount;
                                          this.setState({});
                                          if (tables[ii].balance !== 0) return;
                                          else {
                                            await axios.post(
                                              "http://192.168.2.171:5001/mall-restraunt/us-central1/api/menu/freeTable",
                                              { table: tables[ii] },
                                              { headers: { "x-auth-token": localStorage.getItem("token") } }
                                            );
                                            tables[ii].orderHistory.order = [];
                                            tables[ii].orderHistory.sum = 0;
                                            tables[ii].balance = 0;
                                          }
                                          this.setState({});
                                        }}
                                      />
                                      {/* <form
                                        disabled={tables[ii].orderChange.sum !== 0 || tables[ii].orderHistory.sum === 0 ? true : false}
                                        onSubmit={async (e) => {
                                          e.preventDefault();
                                          try {
                                            var partAmount = this.state.partial ? parseInt(tables[ii].partial) : parseInt(tables[ii].orderHistory.sum);
                                            console.log(tables[ii].uid, this.state.partial ? partAmount : tables[ii].balance);
                                            await axios.post(
                                              "http://192.168.2.171:5001/mall-restraunt/us-central1/api/card/deductAmount",
                                              {
                                                // amount: tables[ii].partial ? partAmont) : tables[ii].orderHistory.sum,

                                                amount: this.state.partial ? partAmount : tables[ii].balance,
                                                uid: tables[ii].uid,
                                                bill: tables[ii].bill,
                                                table: tables[ii].id,
                                              },
                                              { headers: { "x-auth-token": localStorage.getItem("token") } }
                                            );
                                            tables[ii].balance = tables[ii].balance - (this.state.partial ? partAmount : tables[ii].balance);
                                            console.log(tables[ii].balance - (this.state.partial ? parseInt(partAmount) : parseInt(tables[ii].balance)));
                                            tables[ii].partial = "";
                                            tables[ii].uid = "";
                                            AlertDiv("green", "Paid");
                                            this.setState({});
                                            if (this.state.partial) return;
                                            else {
                                              await axios.post(
                                                "http://192.168.2.171:5001/mall-restraunt/us-central1/api/menu/freeTable",
                                                { table: tables[ii] },
                                                { headers: { "x-auth-token": localStorage.getItem("token") } }
                                              );
                                              tables[ii].orderHistory.order = [];
                                              tables[ii].orderHistory.sum = 0;
                                              tables[ii].balance = 0;
                                            }
                                            tables[ii].uid = "";
                                            AlertDiv("green", "Paid");
                                            this.setState({});
                                          } catch (err) {
                                            console.log(err, err.response);
                                            AlertDiv("red", "Couldn't Deduct Money, " + err.response.data);
                                          }
                                        }}
                                      >
                                        <input
                                          type="checkbox"
                                          id="partial"
                                          disabled={tables[ii].orderChange.sum !== 0 || tables[ii].orderHistory.sum === 0 ? true : false}
                                          // value={tables[ii].partial}
                                          onChange={(e) => {
                                            this.setState({ partial: e.target.checked });
                                          }}
                                        />
                                        <label htmlFor="partial">Partial Payment?</label>
                                        <input
                                          type="number"
                                          id="partialAmount"
                                          max={tables[ii].balance}
                                          required
                                          placeholder="Partial Amount"
                                          value={tables[ii].partial}
                                          onChange={(e) => {
                                            e.preventDefault();
                                            var value = e.target.value;
                                            tables[ii].partial = value;
                                            this.setState({});
                                          }}
                                          disabled={!this.state.partial || tables[ii].orderChange.sum !== 0 || tables[ii].orderHistory.sum === 0 ? true : false}
                                        />
                                        <br />
                                        <input
                                          placeholder="UID"
                                          type="text"
                                          id="uidInput"
                                          value={tables[ii].uid}
                                          autoFocus
                                          onChange={(e) => {
                                            e.preventDefault();
                                            tables[ii].uid = e.target.value;
                                            this.setState({});
                                          }}
                                          required
                                          disabled={tables[ii].orderChange.sum !== 0 || tables[ii].orderHistory.sum === 0 ? true : false}
                                        />
                                        <input type="submit" value="Pay by Card" disabled={tables[ii].orderChange.sum !== 0 || tables[ii].orderHistory.sum === 0 ? true : false} />
                                      </form> */}
                                      <button
                                        className="btn btn-primary"
                                        onClick={async (e) => {
                                          e.preventDefault();

                                          //   Payment logic as needed
                                          await axios.post(
                                            "http://192.168.2.171:5001/mall-restraunt/us-central1/api/menu/freeTable",
                                            { table: tables[ii] },
                                            { headers: { "x-auth-token": localStorage.getItem("token") } }
                                          );
                                          tables[ii].orderHistory.order = [];
                                          tables[ii].orderHistory.sum = 0;
                                          tables[ii].balance = 0;
                                          this.setState({});
                                        }}
                                        // disabled={tables[ii].orderChange.sum !== 0 || tables[ii].orderHistory.sum === 0 ? true : false}
                                      >
                                        Free Table
                                      </button>
                                    </Col>
                                  </Row>
                                </Tab.Container>
                              </Tab.Pane>
                            );
                          })}
                        </Tab.Content>
                      </Col>
                    </Row>
                  </Tab.Container>
                </Tab>
              );
            })}
            <button
              onClick={(e) => {
                e.preventDefault();
              }}
              className="btn btn-primary"
            >
              Refresh Status
            </button>
          </Tabs>
        ) : null}
      </div>
    );
  }
}
