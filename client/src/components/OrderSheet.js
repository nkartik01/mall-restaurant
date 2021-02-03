import axios from "axios";
import React, { Component, Fragment } from "react";
import { Tab, Row, Col, Nav } from "react-bootstrap";
import AlertDiv from "../AlertDiv";
import Payment from "./Payment";

export default class OrderSheet extends Component {
  constructor(props) {
    super(props);
    console.log(props);
  }
  afterDisc = () => {
    this.props.getRestaurants();
  };
  render() {
    var menu = this.props.menu;
    var categories = Object.keys(this.props.menu);
    var propsTable = this.props.table;
    propsTable.projectedTotal = propsTable.orderHistory.sum + propsTable.orderChange.sum;
    return (
      <div>
        <Tab.Container id="left-tabs-example" defaultActiveKey="category-0">
          <Row>
            <Col sm={2} style={{ border: "1px solid black", bottom: 0, top: 0, overflow: "auto" }}>
              <h3 style={{ backgroundColor: "red", color: "white" }}>Ordering for {propsTable.table}</h3>
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
                        {menu[category].map((item, _) => {
                          return (
                            <div
                              style={{ backgroundColor: "yellow", border: "1px dotted black", verticalAlign: "middle" }}
                              className="card col-md-3"
                              id={propsTable.table + "-" + item.name + "-" + item.price + "-" + localStorage.getItem("username")}
                              onClick={(e) => {
                                e.preventDefault();
                                if (!propsTable.orderChange) {
                                  propsTable.orderChange = { order: [], sum: 0 };
                                }
                                var tabind = -1;
                                for (var i3 = 0; i3 < propsTable.orderChange.order.length; i3++) {
                                  if (propsTable.orderChange.order[i3].item === item.name) {
                                    tabind = 1;
                                    propsTable.orderChange.order[i3].quantity = propsTable.orderChange.order[i3].quantity + 1;
                                    break;
                                  }
                                }
                                if (tabind !== 1) {
                                  propsTable.orderChange.order.push({
                                    item: item.name,
                                    category,
                                    price: parseInt(item.price),
                                    quantity: 1,
                                  });
                                }
                                propsTable.orderChange.sum = parseInt(propsTable.orderChange.sum) + parseInt(item.price);
                                propsTable.projectedTotal = propsTable.projectedTotal + parseInt(item.price);
                                this.setState({});
                              }}
                            >
                              <h5>{item.name}</h5>
                              {item.price}
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
              {propsTable.orderChange ? (
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
                        {propsTable.orderChange.order.map((item, i1) => {
                          return (
                            <tr>
                              <th scope="row">{i1 + 1}</th>
                              <td align="left">{item.item}</td>
                              <td> {item.price} </td>
                              <td>
                                <button
                                  style={{ borderRadius: "100%" }}
                                  onClick={() => {
                                    var x = propsTable.orderChange.order[i1].quantity;
                                    x = x - 1;
                                    propsTable.orderChange.order[i1].quantity = x;
                                    if (propsTable.orderChange.order[i1].quantity === 0) {
                                      propsTable.orderChange.order.splice(i1, 1);
                                    }
                                    propsTable.orderChange.sum = parseInt(propsTable.orderChange.sum) - parseInt(item.price);
                                    propsTable.projectedTotal = propsTable.projectedTotal - parseInt(item.price);
                                    this.setState({});
                                  }}
                                >
                                  -
                                </button>
                                {" " + item.quantity + " "}
                                <button
                                  style={{ borderRadius: "100%" }}
                                  onClick={() => {
                                    console.log(propsTable.orderHistory);
                                    propsTable.orderChange.order[i1].quantity = propsTable.orderChange.order[i1].quantity + 1;

                                    propsTable.orderChange.sum = propsTable.orderChange.sum + parseInt(item.price);
                                    propsTable.projectedTotal = propsTable.projectedTotal + parseInt(item.price);
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
                          <th>{propsTable.orderChange.sum}</th>
                        </tr>
                      </tbody>
                    </table>
                    <h4>Projected Total: {propsTable.projectedTotal}</h4>
                    <button
                      className="btn btn-primary"
                      onClick={async (e) => {
                        e.target.disabled = true;
                        e.preventDefault();
                        for (var i = 0; i < propsTable.orderChange.order.length; i++) {
                          var c = 0;
                          for (var j = 0; j < propsTable.orderHistory.order.length; j++) {
                            if (propsTable.orderChange.order[i].item === propsTable.orderHistory.order[j].item) {
                              propsTable.orderHistory.order[j].quantity = propsTable.orderHistory.order[j].quantity + propsTable.orderChange.order[i].quantity;
                              c = 1;
                              break;
                            }
                          }
                          if (c === 0) {
                            propsTable.orderHistory.order.push({ ...propsTable.orderChange.order[i] });
                          }
                        }
                        propsTable.orderHistory.sum = propsTable.orderHistory.sum + propsTable.orderChange.sum;
                        propsTable.balance = propsTable.balance + propsTable.orderChange.sum;
                        var res = await axios.post(
                          "http://192.168.2.2:5001/mall-restraunt/us-central1/api/menu/updateTable",
                          { orderHistory: propsTable.orderHistory, orderChange: propsTable.orderChange, table: propsTable },
                          { headers: { "x-auth-token": localStorage.getItem("token") } }
                        );
                        AlertDiv("green", "Order Added");
                        try {
                          res = await axios.post(
                            "http://192.168.2.2:5001/mall-restraunt/us-central1/api/bill/printOrder",
                            { order: propsTable.orderChange, bill: res.data.bill, orderId: res.data.orderId, printer: localStorage.getItem("printer") },
                            { headers: { "x-auth-token": localStorage.getItem("token") } }
                          );
                        } catch (err) {
                          console.log(err, err.response);
                          AlertDiv("red", "Couldn't print bill");
                        }
                        propsTable.bill = res.data.bill;
                        propsTable.orderChange.order = [];
                        propsTable.orderChange.sum = 0;
                        e.target.disabled = false;
                        this.setState({});
                        this.props.getRestaurants();
                      }}
                      disabled={propsTable.orderChange.sum === 0 ? true : false}
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
                  {propsTable.orderHistory.order.map((item, i1) => {
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
                    <th>{propsTable.orderHistory.sum}</th>
                  </tr>
                </tbody>
              </table>
              <h4>Balance: {propsTable.balance ? propsTable.balance : 0}</h4>
              {propsTable.bill && propsTable.bill !== "" ? (
                <Fragment>
                  <Payment
                    amount={propsTable.balance ? propsTable.balance : 0}
                    disable={propsTable.orderChange.sum !== 0 || propsTable.orderHistory.sum === 0 ? true : false}
                    bill={propsTable.bill}
                    table={propsTable.id}
                    orderHistory={propsTable.orderHistory}
                    setState={this.setState1}
                    afterDisc={this.afterDisc}
                    callBack={async (amount) => {
                      console.log(amount);
                      propsTable.balance = propsTable.balance - amount;
                      this.setState({});
                      if (propsTable.balance !== 0) return;
                      else {
                        await axios.post(
                          "http://192.168.1.106:5001/mall-restraunt/us-central1/api/menu/freeTable",
                          { table: propsTable },
                          { headers: { "x-auth-token": localStorage.getItem("token") } }
                        );
                        propsTable.orderHistory.order = [];
                        propsTable.orderHistory.sum = 0;
                        propsTable.balance = 0;
                      }
                      this.setState({});
                    }}
                  />
                </Fragment>
              ) : null}
              <button
                hidden
                className="btn btn-primary"
                onClick={async (e) => {
                  e.preventDefault();

                  //   Payment logic as needed
                  await axios.post(
                    "http://192.168.2.2:5001/mall-restraunt/us-central1/api/menu/freeTable",
                    { table: propsTable },
                    { headers: { "x-auth-token": localStorage.getItem("token") } }
                  );
                  propsTable.orderHistory.order = [];
                  propsTable.orderHistory.sum = 0;
                  propsTable.balance = 0;
                  this.setState({});
                }}
                // disabled={propsTable.orderChange.sum !== 0 || propsTable.orderHistory.sum === 0 ? true : false}
              >
                Free Table
              </button>
            </Col>
          </Row>
        </Tab.Container>
      </div>
    );
  }
}
