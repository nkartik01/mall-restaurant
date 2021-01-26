import axios from "axios";
import React, { Component, Fragment } from "react";
import { Tabs, Tab, Row, Col, Nav } from "react-bootstrap";

export default class TakeOrder extends Component {
  state = {
    isLoading: true,
    menus: {},
  };
  getRestaurants = async () => {
    var res = await axios.get("http://192.168.1.178:5001/mall-restraunt/us-central1/api/operator/getPermissions", {
      headers: { "x-auth-token": localStorage.getItem("token") },
    });
    res = res.data;
    this.setState({ permissions: res.permissions });
    res = await axios.get("http://192.168.1.178:5001/mall-restraunt/us-central1/api/menu/getRestaurantMenus", {
      headers: { "x-auth-token": localStorage.getItem("token") },
    });
    res = res.data;
    console.log(res.menus);
    this.setState({ menus: res.menus });
    res = await axios.get("http://192.168.1.178:5001/mall-restraunt/us-central1/api/menu/getTables", {
      headers: { "x-auth-token": localStorage.getItem("token") },
    });
    res = res.data;
    res.tables.map((table, i) => {
      if (this.state.tables) {
        res.tables[i].orderChange = this.state.tables[i].orderChange;
        this.state.tables[i].orderChange.order.map((order, ind) => {
          var c = 0;
          for (var j = 0; j < table.orderHistory.order.length; j++) {
            if (order.item === table.orderHistory.order[j].item) {
              res.tables[i].orderHistory.order[j].quantity = res.tables[i].orderHistory.order[j].quantity + order.quantity;
              c = 1;
            }
          }
          if (c === 0) {
            res.tables[i].orderHistory.order.push(order);
          }
          return null;
        });
        res.tables[i].orderHistory.sum = res.tables[i].orderHistory.sum + this.state.tables[i].orderChange.sum;
      } else res.tables[i].orderChange = { order: [], sum: 0 };
      console.log(table.orderHistory);
      return null;
    });
    this.setState({ tables: res.tables, isLoading: false });
  };

  componentDidMount() {
    this.interval = setInterval(() => this.getRestaurants(), 10000);
  }
  componentWillUnmount() {
    clearInterval(this.interval);
  }
  render() {
    var rests = Object.keys(this.state.menus);
    return (
      <div style={{ height: "100%" }}>
        {!this.state.isLoading ? (
          <Tabs id="uncontrolled-tab-example" style={{ backgroundColor: "red" }} defaultActiveKey="null">
            <Tab eventKey="null" title="Welcome">
              <p>Select Restraunt and proceed</p>
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
              console.log(this.state.permissions.wait[rest], rest, !this.state.permissions.wait[rest] ? "true" : "false");
              return (
                <Tab eventKey={rest} title={rest} disabled={!this.state.permissions.wait[rest] ? true : false}>
                  <Tab.Container id="left-tabs-example" defaultActiveKey="table-0">
                    <Row>
                      {/* Tables */}
                      <Col sm={2}>
                        <Nav variant="pills" className="flex-column">
                          {tables.map((table, i) => {
                            return (
                              <Nav.Item>
                                <Nav.Link
                                  style={{ backgroundColor: table.orderHistory.sum === 0 ? "green" : "red", color: table.orderHistory.sum === 0 ? "black" : "white" }}
                                  eventKey={"table-" + i}
                                >
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
                                    <Col sm={2}>
                                      <h3 style={{ backgroundColor: "red", color: "white" }}>Ordering for {table.table}</h3>
                                      <Nav varient="pills" className="flex-column">
                                        {categories.map((category, i2) => {
                                          return (
                                            <Nav.Item>
                                              <Nav.Link eventKey={"category-" + i2}>{category}</Nav.Link>
                                            </Nav.Item>
                                          );
                                        })}
                                      </Nav>
                                    </Col>
                                    <Col sm={6}>
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
                                                        console.log(e.target.id);
                                                        if (!tables[ii].orderChange) {
                                                          tables[ii].orderChange = { order: [], sum: 0 };
                                                        }
                                                        var tabind = -1;
                                                        for (var i3 = 0; i3 < tables[ii].orderChange.order.length; i3++) {
                                                          if (tables[ii].orderChange.order[i3].item === item.name) {
                                                            tabind = 1;
                                                            tables[ii].orderChange.order[i3].quantity = tables[ii].orderChange.order[i3].quantity + 1;
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
                                                        console.log(tables[ii].orderHistory);
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
                                    <Col sm={4}>
                                      {tables[ii].orderChange ? (
                                        <Fragment>
                                          <h3 style={{ backgroundColor: "blue", color: "white" }}>Running Order</h3>
                                          <br />
                                          <div>
                                            <table className="table table-bordered">
                                              <thead>
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
                                              </thead>
                                              {tables[ii].orderChange.order.map((item, i1) => {
                                                return (
                                                  <tr>
                                                    <th scope="row">{i1 + 1}</th>
                                                    <td align="left">{item.item}</td>
                                                    <td> {item.price} </td>
                                                    <td>
                                                      <button
                                                        style={{ borderRadius: "100%" }}
                                                        onClick={(e) => {
                                                          e.preventDefault();
                                                          tables[ii].orderChange.order[i1].quantity = tables[ii].orderChange.order[i1].quantity - 1;
                                                          if (tables[ii].orderChange.order[i1].quantity === 0) {
                                                            tables[ii].orderChange.order.splice(i1, 1);
                                                          }
                                                          tables[ii].orderChange.sum = parseInt(tables[ii].orderChange.sum) - parseInt(item.price);
                                                          tables[ii].orderHistory.sum = tables[ii].orderHistory.sum - parseInt(item.price);
                                                          console.log(tables[ii].orderHistory.order.length);
                                                          for (var i3 = 0; i3 < tables[ii].orderHistory.order.length; i3++) {
                                                            console.log(tables[ii].orderHistory.order[i3].item, item.item);
                                                            if (tables[ii].orderHistory.order[i3].item === item.item) {
                                                              tables[ii].orderHistory.order[i3].quantity = tables[ii].orderHistory.order[i3].quantity - 1;
                                                            }
                                                            if (tables[ii].orderHistory.order[i3].quantity === 0) {
                                                              tables[ii].orderHistory.order.splice(i3, 1);
                                                            }
                                                            break;
                                                          }
                                                          this.setState({});
                                                        }}
                                                      >
                                                        -
                                                      </button>
                                                      {" " + item.quantity + " "}
                                                      <button
                                                        style={{ borderRadius: "100%" }}
                                                        onClick={(e) => {
                                                          e.preventDefault();
                                                          tables[ii].orderChange.order[i1].quantity = tables[ii].orderChange.order[i1].quantity + 1;

                                                          tables[ii].orderChange.sum = tables[ii].orderChange.sum + parseInt(item.price);
                                                          tables[ii].orderHistory.sum = tables[ii].orderHistory.sum + parseInt(item.price);

                                                          for (var i3 = 0; i3 < tables[ii].orderHistory.order.length; i3++) {
                                                            if (tables[ii].orderHistory.order[i3].item === item.item) {
                                                              tables[ii].orderHistory.order[i3].quantity = tables[ii].orderHistory.order[i3].quantity + 1;
                                                            }
                                                            break;
                                                          }
                                                          this.setState({});
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
                                            </table>
                                            <button
                                              className="btn btn-primary"
                                              onClick={async (e) => {
                                                e.target.disabled = true;
                                                e.preventDefault();
                                                await axios.post(
                                                  "http://192.168.1.178:5001/mall-restraunt/us-central1/api/menu/updateTable",
                                                  { orderHistory: tables[ii].orderHistory, orderChange: tables[ii].orderChange, table: tables[ii] },
                                                  { headers: { "x-auth-token": localStorage.getItem("token") } }
                                                );
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
                                          <th scope="col">S No.</th>
                                          <th scope="col">Item</th>
                                          <th scope="col">Price</th>
                                          <th scope="col">Quantity</th>
                                          <th scope="col">Amount</th>
                                        </thead>
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
                                      </table>
                                      <button
                                        className="btn btn-primary"
                                        onClick={async (e) => {
                                          e.preventDefault();
                                          //   Payment logic as needed
                                          await axios.post(
                                            "http://192.168.1.178:5001/mall-restraunt/us-central1/api/menu/freeTable",
                                            { table: tables[ii] },
                                            { headers: { "x-auth-token": localStorage.getItem("token") } }
                                          );
                                          tables[ii].orderHistory.order = [];
                                          tables[ii].orderHistory.sum = 0;
                                          this.setState({});
                                        }}
                                        disabled={tables[ii].orderChange.sum === 0 ? false : true}
                                      >
                                        Pay
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
          </Tabs>
        ) : null}
      </div>
    );
  }
}
