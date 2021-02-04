import React, { Component } from "react";

export default class Report extends Component {
  state = {};
  render() {
    return (
      <div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            console.log(new Date(this.state.date).valueOf());
            // .toLocaleString("en-GB"));
          }}
        >
          <input
            type="date"
            value={this.state.date}
            onChange={(e) => {
              e.preventDefault();
              this.setState({ date: e.target.value });
            }}
          />
          <input type="submit" />
        </form>
      </div>
    );
  }
}
