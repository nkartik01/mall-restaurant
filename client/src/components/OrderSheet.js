import { Modal } from "react-bootstrap";
import axios from "axios";
import React, { Component, Fragment } from "react";
import { Tab, Row, Col, Nav } from "react-bootstrap";
import AlertDiv from "../AlertDiv";
import Payment from "./Payment";

export default class OrderSheet extends Component {
  afterDisc = () => {
    this.props.getRestaurants();
  };
  state = {
    proposedChanges: { order: [], sum: 0, reason: "" },
    historyCopy: { order: [], sum: 0 },
  };
  render() {
    var propsTable = this.props.table;
    propsTable.projectedTotal =
      propsTable.orderHistory.sum + propsTable.orderChange.sum;
    return (
      <div>
        <Tab.Container id="left-tabs-example" defaultActiveKey="category-0">
          <Row>
            <Col
              sm={2}
              style={{
                border: "1px solid black",
                bottom: 0,
                top: 0,
                overflow: "auto",
              }}
            >
              <h3 style={{ backgroundColor: "red", color: "white" }}>
                Ordering for {propsTable.table}
              </h3>
              <Nav varient="pills" className="flex-column">
                {this.props.menu.map((menu, _) => {
                  var categories = menu.order;
                  return (
                    <div key={menu.menuId}>
                      {categories.map((category, _) => {
                        return (
                          <Nav.Item key={category}>
                            <Nav.Link
                              className={"activeColor"}
                              style={{ borderBottom: "1px solid black" }}
                              eventKey={"category-" + category}
                            >
                              {category}
                            </Nav.Link>
                          </Nav.Item>
                        );
                      })}
                    </div>
                  );
                })}
              </Nav>
            </Col>
            <Col sm={6} style={{ border: "1px solid black" }}>
              <Tab.Content>
                {this.props.menu.map((menu, _) => {
                  var categories = menu.order;
                  return (
                    <Fragment key={menu.menuId}>
                      {categories.map((category, _) => {
                        // console.log(menu[category], category);
                        return (
                          <Tab.Pane
                            eventKey={"category-" + category}
                            title={category}
                            key={category}
                          >
                            <div
                              className="row"
                              style={{ verticalAlign: "top" }}
                            >
                              {menu.menu[category].map((item, _) => {
                                return (
                                  <div
                                    key={item.name + item.price}
                                    style={{
                                      backgroundColor: "yellow",
                                      border: "1px dotted black",
                                      verticalAlign: "middle",
                                    }}
                                    className="card col-md-3"
                                    id={
                                      propsTable.table +
                                      "-" +
                                      item.name +
                                      "-" +
                                      item.price +
                                      "-" +
                                      localStorage.getItem("username")
                                    }
                                    onClick={(e) => {
                                      e.preventDefault();
                                      if (this.state.edit) return;
                                      if (!propsTable.orderChange) {
                                        propsTable.orderChange = {
                                          order: [],
                                          sum: 0,
                                        };
                                      }
                                      var tabind = -1;
                                      for (
                                        var i = 0;
                                        i < propsTable.orderChange.order.length;
                                        i++
                                      ) {
                                        if (
                                          propsTable.orderChange.order[i]
                                            .item === item.name
                                        ) {
                                          tabind = 1;
                                          propsTable.orderChange.order[
                                            i
                                          ].quantity =
                                            propsTable.orderChange.order[i]
                                              .quantity + 1;
                                          break;
                                        }
                                      }
                                      if (tabind !== 1) {
                                        propsTable.orderChange.order.push({
                                          disc: menu.disc,
                                          tax: menu.tax,
                                          item: item.name,
                                          kot: menu.kot,
                                          counterName: menu.counterName,
                                          menuId: menu.menuId,
                                          category,
                                          price: parseInt(item.price),
                                          quantity: 1,
                                        });
                                      }
                                      propsTable.orderChange.sum =
                                        parseInt(propsTable.orderChange.sum) +
                                        parseInt(item.price);
                                      propsTable.projectedTotal =
                                        propsTable.projectedTotal +
                                        parseInt(item.price);
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
                    </Fragment>
                  );
                })}
              </Tab.Content>
            </Col>
            <Col sm={4} style={{ border: "1px solid black" }}>
              {propsTable.orderChange ? (
                <Fragment>
                  <h3 style={{ backgroundColor: "blue", color: "white" }}>
                    Running Order {propsTable.bill}
                  </h3>
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
                        {propsTable.orderChange.order.map((item, i) => {
                          return (
                            <tr key={i}>
                              <th scope="row">{i + 1}</th>
                              <td align="left">{item.item}</td>
                              <td> {item.price} </td>
                              <td>
                                <button
                                  disabled={this.state.edit}
                                  style={{ borderRadius: "100%" }}
                                  onClick={() => {
                                    var x =
                                      propsTable.orderChange.order[i].quantity;
                                    x = x - 1;
                                    propsTable.orderChange.order[i].quantity =
                                      x;
                                    if (
                                      propsTable.orderChange.order[i]
                                        .quantity === 0
                                    ) {
                                      propsTable.orderChange.order.splice(i, 1);
                                    }
                                    propsTable.orderChange.sum =
                                      parseInt(propsTable.orderChange.sum) -
                                      parseInt(item.price);
                                    propsTable.projectedTotal =
                                      propsTable.projectedTotal -
                                      parseInt(item.price);
                                    this.setState({});
                                  }}
                                >
                                  -
                                </button>
                                {" " + item.quantity + " "}
                                <button
                                  disabled={this.state.edit}
                                  style={{ borderRadius: "100%" }}
                                  onClick={() => {
                                    console.log(propsTable.orderHistory);
                                    propsTable.orderChange.order[i].quantity =
                                      propsTable.orderChange.order[i].quantity +
                                      1;

                                    propsTable.orderChange.sum =
                                      propsTable.orderChange.sum +
                                      parseInt(item.price);
                                    propsTable.projectedTotal =
                                      propsTable.projectedTotal +
                                      parseInt(item.price);
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
                        for (
                          var i = 0;
                          i < propsTable.orderChange.order.length;
                          i++
                        ) {
                          var c = 0;
                          for (
                            var j = 0;
                            j < propsTable.orderHistory.order.length;
                            j++
                          ) {
                            if (
                              propsTable.orderChange.order[i].item ===
                              propsTable.orderHistory.order[j].item
                            ) {
                              propsTable.orderHistory.order[j].quantity =
                                propsTable.orderHistory.order[j].quantity +
                                propsTable.orderChange.order[i].quantity;
                              c = 1;
                              break;
                            }
                          }
                          if (c === 0) {
                            propsTable.orderHistory.order.push({
                              ...propsTable.orderChange.order[i],
                            });
                          }
                        }
                        propsTable.orderHistory.sum =
                          propsTable.orderHistory.sum +
                          propsTable.orderChange.sum;
                        propsTable.balance =
                          propsTable.balance + propsTable.orderChange.sum;
                        var orders = {};
                        propsTable.orderChange.order.map((item, _) => {
                          if (!orders[item.menuId]) {
                            orders[item.menuId] = { order: [], sum: 0 };
                          }
                          orders[item.menuId].order.push(item);
                          orders[item.menuId].sum =
                            orders[item.menuId].sum +
                            item.price * item.quantity;
                          return null;
                        });
                        var res = await axios.post(
                          localStorage.getItem("apiUrl") + "menu/updateTable",
                          {
                            orderHistory: propsTable.orderHistory,
                            orderChange: propsTable.orderChange,
                            table: propsTable,
                            chefBreakDown: orders,
                          },
                          {
                            headers: {
                              "x-auth-token": localStorage.getItem("token"),
                            },
                          }
                        );
                        AlertDiv("green", "Order Added");
                        // console.log(orders);

                        if (localStorage.getItem("printKOT") !== "false")
                          Object.keys(orders)
                            .sort()
                            .map(async (order, _) => {
                              try {
                                await axios.post(
                                  localStorage.getItem("apiUrl") +
                                    "bill/printOrder",
                                  {
                                    kot: true,
                                    order: orders[order],
                                    table: propsTable.table,
                                    bill: res.data.bill,
                                    orderId: res.data.orderId,
                                    counterName:
                                      orders[order].order[0].counterName,
                                    printer: orders[order].order[0].kot,
                                    restaurant: propsTable.restaurant,
                                  },
                                  {
                                    headers: {
                                      "x-auth-token":
                                        localStorage.getItem("token"),
                                    },
                                  }
                                );
                              } catch (err) {
                                console.log(err, err.response);
                                AlertDiv("red", "Couldn't print KOT");
                              }
                              return null;
                            });

                        if (localStorage.getItem("printOrderSlip") !== "false")
                          if (localStorage.getItem("oneOrderSlip") !== "true")
                            Object.keys(orders)
                              .sort()
                              .map(async (order, _) => {
                                try {
                                  console.log(order);
                                  await axios.post(
                                    localStorage.getItem("apiUrl") +
                                      "bill/printOrder",
                                    {
                                      // kot: true,
                                      order: orders[order],
                                      table: propsTable.table,
                                      bill: res.data.bill,
                                      orderId: res.data.orderId,
                                      printer: localStorage.getItem("printer"),
                                      restaurant: propsTable.restaurant,
                                      counterName:
                                        orders[order].order[0].counterName,
                                    },
                                    {
                                      headers: {
                                        "x-auth-token":
                                          localStorage.getItem("token"),
                                      },
                                    }
                                  );
                                } catch (err) {
                                  console.log(err, err.response);
                                  AlertDiv("red", "Couldn't print KOT");
                                }
                                return null;
                              });
                          else
                            try {
                              await axios.post(
                                localStorage.getItem("apiUrl") +
                                  "bill/printOrder",
                                {
                                  counterName: "",
                                  printer: localStorage.getItem("printer"),
                                  order: propsTable.orderChange,
                                  table: propsTable.table,
                                  bill: res.data.bill,
                                  orderId: res.data.orderId,
                                  restaurant: propsTable.restaurant,
                                },
                                {
                                  headers: {
                                    "x-auth-token":
                                      localStorage.getItem("token"),
                                  },
                                }
                              );
                            } catch (err) {
                              console.log(err, err.response);
                              AlertDiv("red", "Couldn't print order");
                            }
                        propsTable.bill = res.data.bill;
                        propsTable.orderChange.order = [];
                        propsTable.orderChange.sum = 0;
                        e.target.disabled = false;
                        this.setState({});
                        this.props.getRestaurants();
                      }}
                      disabled={
                        this.state.edit || propsTable.orderChange.sum === 0
                          ? true
                          : false
                      }
                    >
                      Add to Order
                    </button>
                  </div>
                </Fragment>
              ) : null}
              {/* Edit table */}
              {propsTable.bill && propsTable.bill !== "" ? (
                <Fragment>
                  {!this.state.edit ? (
                    <button
                      disabled={
                        !(
                          propsTable.orderHistory.sum === 0 ||
                          propsTable.orderChange.sum === 0
                        )
                      }
                      className="btn btn-primary"
                      onClick={(e) => {
                        e.preventDefault();
                        var order = [];
                        propsTable.orderHistory.order.map((ord, _) => {
                          order.push({ ...ord });
                          return null;
                        });

                        this.setState({
                          edit: true,
                          historyCopy: {
                            order,
                            sum: propsTable.orderHistory.sum,
                          },
                        });
                      }}
                    >
                      Edit Order
                    </button>
                  ) : (
                    <Fragment>
                      <form
                        onSubmit={async (e) => {
                          e.preventDefault();
                          console.log(
                            this.state.proposedChanges,
                            this.state.historyCopy
                          );
                          await axios.post(
                            localStorage.getItem("apiUrl") + "bill/editBill",
                            {
                              table: propsTable.id,
                              bill: propsTable.bill,
                              orderHistory: this.state.historyCopy,
                              orderChange: this.state.proposedChanges,
                            },
                            {
                              headers: {
                                "x-auth-token": localStorage.getItem("token"),
                              },
                            }
                          );
                          propsTable.orderHistory = this.state.historyCopy;

                          propsTable.balance =
                            propsTable.balance - this.state.proposedChanges.sum;
                          this.setState({
                            edit: false,
                            proposedChanges: { reason: "", sum: 0, order: [] },
                          });
                        }}
                      >
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
                            {this.state.historyCopy.order.map((item, i) => {
                              return (
                                <tr key={i}>
                                  <th scope="row">{i + 1}</th>
                                  <td align="left">{item.item}</td>
                                  <td> {item.price} </td>
                                  <td>
                                    <button
                                      style={{ borderRadius: "100%" }}
                                      onClick={(e) => {
                                        e.preventDefault();
                                        console.log(this.state);
                                        var { historyCopy, proposedChanges } =
                                          this.state;
                                        var x = historyCopy.order[i].quantity;
                                        x = x - 1;
                                        historyCopy.order[i].quantity = x;
                                        var c = 0;

                                        for (
                                          var j = 0;
                                          j < proposedChanges.order.length;
                                          j++
                                        ) {
                                          if (
                                            proposedChanges.order[j].item ===
                                            historyCopy.order[i].item
                                          ) {
                                            proposedChanges.order[j].quantity =
                                              proposedChanges.order[j]
                                                .quantity + 1;
                                            c = 1;
                                            break;
                                          }
                                        }

                                        if (c === 0) {
                                          proposedChanges.order.push({
                                            item: item.item,
                                            price: parseInt(item.price),
                                            quantity: 1,
                                          });
                                        }

                                        historyCopy.sum =
                                          parseInt(historyCopy.sum) -
                                          parseInt(item.price);

                                        if (
                                          historyCopy.order[i].quantity === 0
                                        ) {
                                          historyCopy.order.splice(i, 1);
                                        }
                                        proposedChanges.sum =
                                          proposedChanges.sum +
                                          parseInt(item.price);
                                        this.setState({
                                          historyCopy,
                                          proposedChanges,
                                        });
                                      }}
                                    >
                                      -
                                    </button>
                                    {" " + item.quantity + " "}
                                    {/* <button
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
                            </button> */}
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
                              <th>{this.state.historyCopy.sum}</th>
                            </tr>
                          </tbody>
                        </table>
                        <input
                          type="text"
                          required
                          className="form-control"
                          placeholder="Reason for Changes"
                          value={this.state.proposedChanges.reason}
                          onChange={(e) => {
                            e.preventDefault();
                            const { proposedChanges } = this.state;
                            proposedChanges.reason = e.target.value;
                            this.setState({ proposedChanges });
                          }}
                        />
                        <button
                          className="btn btn-secondary"
                          onClick={(e) => {
                            e.preventDefault();
                            this.setState({
                              edit: false,
                              proposedChanges: {
                                order: [],
                                sum: 0,
                                reason: "",
                              },
                            });
                          }}
                        >
                          Cancel
                        </button>
                        <input
                          type="submit"
                          className="btn btn-secondary"
                          value="Done"
                        />
                      </form>
                    </Fragment>
                  )}
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
                  {propsTable.orderHistory.order.map((item, i) => {
                    return (
                      <tr key={i}>
                        <th scope="row">{i + 1}</th>
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
                    restaurant={propsTable.restaurant}
                    amount={propsTable.balance ? propsTable.balance : 0}
                    disable={
                      propsTable.orderChange.sum !== 0 ||
                      propsTable.orderHistory.sum === 0
                        ? true
                        : false
                    }
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
                          localStorage.getItem("apiUrl") + "menu/freeTable",
                          { table: propsTable },
                          {
                            headers: {
                              "x-auth-token": localStorage.getItem("token"),
                            },
                          }
                        );
                        propsTable.orderHistory.order = [];
                        propsTable.orderHistory.sum = 0;
                        propsTable.balance = 0;
                      }
                      this.afterDisc();
                      this.setState({});
                    }}
                  />
                </Fragment>
              ) : null}
              {this.state.activeTables ? (
                <Modal
                  size="xl"
                  show={this.state.show}
                  onHide={() => {
                    this.setState({ show: false });
                  }}
                >
                  <Modal.Header closeButton>Choose the table</Modal.Header>
                  <Modal.Body>
                    <div className="row">
                      {this.state.activeTables.map((table) => {
                        if (table.table !== propsTable.table)
                          return (
                            <div
                              onClick={async (e) => {
                                e.preventDefault();
                                var confirm = window.confirm(
                                  "Are you sure you want to merge " +
                                    table.table +
                                    " into " +
                                    propsTable.table +
                                    "?"
                                );
                                if (!confirm) return;
                                await axios.post(
                                  localStorage.getItem("apiUrl") + "bill/merge",
                                  {
                                    table1: table.tableId,
                                    table2: propsTable.tableId,
                                    restaurant: propsTable.restaurant,
                                  },
                                  {
                                    headers: {
                                      "x-auth-token":
                                        localStorage.getItem("token"),
                                    },
                                  }
                                );
                                window.location.reload();
                              }}
                              className="col-md-3"
                              key={table.bill}
                              style={{
                                border: "1px solid black",
                                backgroundColor: "#eeee99",
                                padding: "5px",
                                borderRadius: "5px",
                              }}
                            >
                              <h5>{table.table}</h5>
                            </div>
                          );
                        return null;
                      })}
                    </div>
                  </Modal.Body>
                </Modal>
              ) : null}
              {propsTable.bill &&
              propsTable.bill !== "" &&
              propsTable.balance !== 0 ? (
                <button
                  className="btn btn-primary"
                  onClick={async (e) => {
                    e.preventDefault();
                    var res = await axios.get(
                      localStorage.getItem("apiUrl") +
                        "bill/activeTables/" +
                        propsTable.restaurant,
                      {
                        headers: {
                          "x-auth-token": localStorage.getItem("token"),
                        },
                      }
                    );
                    res = res.data;
                    this.setState({ activeTables: res.tables, show: true });
                  }}
                >
                  Merge Bill
                </button>
              ) : null}
              <button
                className="btn btn-primary"
                onClick={async (e) => {
                  e.preventDefault();

                  //   Payment logic as needed
                  await axios.post(
                    localStorage.getItem("apiUrl") + "menu/freeTable",
                    { table: propsTable },
                    {
                      headers: {
                        "x-auth-token": localStorage.getItem("token"),
                      },
                    }
                  );
                  propsTable.orderHistory.order = [];
                  propsTable.orderHistory.sum = 0;
                  propsTable.balance = 0;
                  this.props.getRestaurants();
                  this.setState({});
                }}
                hidden={
                  propsTable.bill === "" || propsTable.balance !== 0
                    ? true
                    : false
                }
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
