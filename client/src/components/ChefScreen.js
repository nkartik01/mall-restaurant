import React, { Component } from "react";
import Masonry from "react-masonry-component";
export default class ChefScreen extends Component {
  render() {
    return (
      <div>
        <Masonry elementType="ul">
          {orders.map((order, i) => {
            var time = Date.now() - order.time;
            return {};
          })}
        </Masonry>
      </div>
    );
  }
}
