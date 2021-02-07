import axios from "axios";
import React, { Component } from "react";
import { Tabs, Tab, Row, Col, Nav } from "react-bootstrap";
import { setData } from "../redux/action/loadedData";
import OrderSheet from "./OrderSheet";

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
  getMenus = async () => {
    var res = await axios.get(require("../config.json").url + "operator/getPermissions", {
      headers: { "x-auth-token": localStorage.getItem("token") },
    });
    res = res.data;
    this.setState({ permissions: res.permissions });
    res = await axios.get(require("../config.json").url + "menu/getRestaurantMenus", {
      headers: { "x-auth-token": localStorage.getItem("token") },
    });
    res = res.data;
    this.setState({ menus: res.menus });
  };
  getRestaurants = async () => {
    var res = await axios.get(require("../config.json").url + "menu/getTables", {
      headers: { "x-auth-token": localStorage.getItem("token") },
    });
    res = res.data;

    var tables = this.state.tables;
    for (var i = 0; i < res.tables.length; i++) {
      if (tables && tables[i].orderChange.sum !== 0) {
        res.tables[i].orderChange = tables[i].orderChange;
        res.tables[i].orderHistory = tables[i].orderHistory;
        res.tables[i].balance = tables[i].balance;
      } else res.tables[i].orderChange = { order: [], sum: 0 };
    }
    this.setState({ tables: res.tables, isLoading: false });
    this.setRedux();
  };
  setRedux = () => {
    this.props.store.dispatch(setData({ tables: this.state.tables, menus: this.state.menus, permissions: this.state.permissions, hi: "hi" }));
  };
  componentDidMount() {
    this.getRestaurants();
    this.getMenus();
    this.interval = setInterval(() => this.getRestaurants(), 60000);
  }
  componentWillUnmount() {
    clearInterval(this.interval);
  }
  render() {
    var rests = Object.keys(this.state.menus);
    return (
      <div style={{ height: "100%" }}>
        {!this.state.isLoading ? (
          <Tabs id="uncontrolled-tab-example" style={{ backgroundColor: "wheat", fontWeight: "bold" }} defaultActiveKey="null">
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

            {rests.map((rest, _) => {
              var tables = this.state.tables.filter((elem, _) => {
                if (elem.restaurant === rest) {
                  return true;
                }
                return false;
              });
              return (
                <Tab eventKey={rest} key={rest} title={rest} disabled={!this.state.permissions.wait[rest] ? true : false} style={{ fontWeight: "bold" }}>
                  <Tab.Container id="left-tabs-example" defaultActiveKey="table-0">
                    <Row>
                      {/* Tables */}
                      <Col sm={2} style={{ maxHeight: "100%", bottom: 0, top: 0, overflow: "auto" }}>
                        <Nav variant="pills" className="flex-column">
                          {tables.map((table, i) => {
                            var status = table.orderHistory.sum === 0 ? "free" : "occupied";
                            return (
                              <Nav.Item key={i}>
                                <Nav.Link className={"activeColor " + status} style={{ fontWeight: "bold" }} eventKey={"table-" + i}>
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
                              <Tab.Pane eventKey={"table-" + ii} id="left-tabs-example" key={ii}>
                                <OrderSheet menu={this.state.menus[rest]} table={table} getRestaurants={this.getRestaurants} />
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
