import axios from "axios";
import React, { Component, Fragment } from "react";
import { Tabs, Tab, Row, Col, Nav } from "react-bootstrap";

export default class TakeOrder extends Component {
  state = {
    isLoading: true,
    menus: {},
  };
  getRestaurants = async () => {
    var res = await axios.get("http://localhost:5001/mall-restraunt/us-central1/api/operator/getPermissions", {
      headers: { "x-auth-token": localStorage.getItem("token") },
    });
    res = res.data;
    this.setState({ permissions: res.permissions });
    res = await axios.get("http://localhost:5001/mall-restraunt/us-central1/api/menu/getRestaurantMenus", {
      headers: { "x-auth-token": localStorage.getItem("token") },
    });
    res = res.data;
    console.log(res.menus);
    this.setState({ menus: res.menus });
    res = await axios.get("http://localhost:5001/mall-restraunt/us-central1/api/menu/getTables", {
      headers: { "x-auth-token": localStorage.getItem("token") },
    });
    res = res.data;
    res.tables.map((table, i) => {
      res.tables[i].orderChange = { order: [], sum: 0 };
      return null;
    });
    this.setState({ tables: res.tables, isLoading: false });
  };

  componentDidMount() {
    this.getRestaurants();
  }
  render() {
    var rests = Object.keys(this.state.menus);
    return (
      <div>
        {!this.state.isLoading ? (
          <Tabs id="uncontrolled-tab-example">
            {/* <Tab
              eventKey="Counter"
              title="Counter"
              disabled={
                this.state.permissions.restaurant.counter ? "true" : "false"
              }
            >
              <p>hello</p>
            </Tab> */}

            {/* Restraunts */}
            {rests.map((rest, ind) => {
              var categories = Object.keys(this.state.menus[rest]);
              var tables = this.state.tables.filter((elem, x) => {
                if (elem.restaurant === rest) {
                  return true;
                }
                return false;
              });
              console.log(tables);
              return (
                <Tab eventKey={rest} title={rest}>
                  <Tab.Container id="left-tabs-example" defaultActiveKey="first" disabled={this.state.permissions.restaurant[rest] ? "true" : "false"}>
                    <Row>
                      {/* Tables */}
                      <Col sm={2}>
                        <Nav variant="pills" className="flex-column">
                          {tables.map((table, i) => {
                            return (
                              <Nav.Item>
                                <Nav.Link style={{ backgroundColor: table.orderHistory.sum === 0 ? "green" : "red" }} eventKey={i}>
                                  {table.table}
                                </Nav.Link>
                              </Nav.Item>
                            );
                          })}
                        </Nav>
                      </Col>
                      <Col sm={9}>
                        <Tab.Content>
                          {/* menu categories */}

                          {tables.map((table, ii) => {
                            return (
                              <Fragment>
                                <Tab.Pane eventKey={ii}>
                                  <Tabs id="controlled-tab-example">
                                    {categories.map((category, i2) => {
                                      return (
                                        <Tab eventKey={i2} title={category}>
                                          <div className="row">
                                            {this.state.menus[rest][category].map((item, iii) => {
                                              return (
                                                <div
                                                  className="card col-md-2"
                                                  id={table.table + "-" + item.name + "-" + item.price + "-" + localStorage.getItem("username")}
                                                  onClick={(e) => {
                                                    e.preventDefault();
                                                    console.log(e.target.id);
                                                    var x = e.target.id.split("-");
                                                    if (!tables[ii].orderChange) {
                                                      tables[ii].orderChange = { order: [], sum: 0 };
                                                    }
                                                    var tabind = -1;
                                                    for (var i3 = 0; i3 < tables[ii].orderChange.order.length; i3++) {
                                                      if (tables[ii].orderChange.order[i3].item === x[1]) {
                                                        tabind = 1;
                                                        tables[ii].orderChange.order[i3].quantity = tables[ii].orderChange.order[i3].quantity + 1;
                                                      }
                                                    }
                                                    if (tabind !== 1) {
                                                      tables[ii].orderChange.order.push({
                                                        item: x[1],
                                                        price: x[2],
                                                        quantity: 1,
                                                      });
                                                    }
                                                    tabind = -1;
                                                    for (i3 = 0; i3 < tables[ii].orderHistory.order.length; i3++) {
                                                      if (tables[ii].orderHistory.order[i3].item === x[1]) {
                                                        tabind = 1;
                                                        tables[ii].orderHistory.order[i3].quantity = tables[ii].orderHistory.order[i3].quantity + 1;
                                                      }
                                                    }
                                                    if (tabind !== 1) {
                                                      tables[ii].orderHistory.order.push({
                                                        item: x[1],
                                                        price: x[2],
                                                        quantity: 1,
                                                      });
                                                    }
                                                    tables[ii].orderHistory.sum = parseInt(tables[ii].orderHistory.sum) + parseInt(x[2]);
                                                    tables[ii].orderChange.sum = tables[ii].orderChange.sum + parseInt(x[2]);
                                                    console.log(tables[ii].orderHistory);
                                                    this.setState({});
                                                  }}
                                                >
                                                  {item.name}
                                                  <br />
                                                  {item.price}
                                                  <br />
                                                </div>
                                              );
                                            })}

                                            {tables[ii].orderChange ? (
                                              <Fragment>
                                                <h3>Current changes</h3>
                                                <br />
                                                <div>
                                                  <table className="table table-bordered">
                                                    <thead>
                                                      <th scope="col">Serial Number</th>
                                                      <th scope="col">Item</th>
                                                      <th scope="col">Price</th>
                                                      <th scope="col">Quantity</th>
                                                      <th scope="col">Amount</th>
                                                    </thead>
                                                    {tables[ii].orderChange.order.map((item, i1) => {
                                                      return (
                                                        <tr>
                                                          <th scope="row">{i1 + 1}</th>
                                                          <td>{item.item}</td>
                                                          <td>
                                                            <button
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
                                                            {item.price}
                                                            <button
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
                                                      <th>{tables[ii].orderChange.sum}</th>
                                                    </tr>
                                                  </table>
                                                  <button
                                                    className="btn btn-primary"
                                                    onClick={async (e) => {
                                                      e.target.disabled = true;
                                                      e.preventDefault();
                                                      await axios.post(
                                                        "http://localhost:5001/mall-restraunt/us-central1/api/menu/updateTable",
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
                                                <th scope="col">Serial Number</th>
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
                                                  "http://localhost:5001/mall-restraunt/us-central1/api/menu/freeTable",
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
                                          </div>
                                        </Tab>
                                      );
                                    })}
                                  </Tabs>
                                </Tab.Pane>
                              </Fragment>
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
