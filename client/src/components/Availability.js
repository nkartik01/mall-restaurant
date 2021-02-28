import React, { Component, Fragment } from "react";
import { Col, Row, Tab, Nav } from "react-bootstrap";
import Calendar from "./Calendar";

export default class Availability extends Component {
  state = { rooms: [301, 302, 303, 304], selected: 301 };
  render() {
    // var selected = <Calendar room={this.state.selected} />;

    // console.log(selected);
    return (
      <div>
        <Tab.Container id="left-tabs-example" defaultActiveKey="room-0">
          <Row>
            <Col sm={2} style={{ border: "1px solid black", bottom: 0, top: 0, overflow: "auto" }}>
              <Nav varient="pills" className="flex-column">
                {this.state.rooms.map((room) => {
                  return (
                    <Fragment>
                      <Nav.Item key={room}>
                        <Nav.Link className={"activeColor"} style={{ borderBottom: "1px solid black" }} eventKey={"room-" + room}>
                          {room}
                        </Nav.Link>
                      </Nav.Item>
                    </Fragment>
                  );
                })}
              </Nav>
            </Col>
            <Col sm={6} style={{ border: "1px solid black" }}>
              <Tab.Content>
                {this.state.rooms.map((room) => {
                  // console.log(menu[room], room);
                  return (
                    <Tab.Pane eventKey={"room-" + room} title={room} key={room}>
                      <Calendar hidden={room !== this.state.selected} room={room} />
                    </Tab.Pane>
                  );
                })}
              </Tab.Content>
            </Col>
          </Row>
        </Tab.Container>
      </div>
    );
  }
}
