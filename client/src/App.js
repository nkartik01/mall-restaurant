import "./App.css";
import { HashRouter as Router, Route, Switch } from "react-router-dom";
import Landing from "./components/Landing";
import AdminLogin from "./components/AdminLogin";
import OperatorSignup from "./components/OperatorSignup";

import ChefSignup from "./components/ChefSignup";
import OperatorEdit from "./components/OperatorEdit";
import ListOperators from "./components/ListOperators";
import TakeOrder from "./components/TakeOrder";
import Header from "./components/Header";
import Footer from "./components/Footer";
import RegisterRFID from "./components/RegisterRFID";
import ManipulateRFID from "./components/ManipulateRFID";
import BillList from "./components/BillList";
import Bill from "./components/Bill";
import Booking from "./components/Booking";
import Report from "./components/Report";
import Availability from "./components/Availability";
import ListChef from "./components/ListChef";
import ChefEdit from "./components/ChefEdit";
import Revert from "./components/Revert";
import { useEffect } from "react";

function App(props) {
  useEffect(() => {
    localStorage.setItem(
      "apiUrl",
      window.location.href
        .split("/")
        .slice(0, 3)
        .join("/")
        .split(":")
        .slice(0, 2)
        .join(":") + ":5000/api/"
    );
    console.log(localStorage.getItem("apiUrl"));
  }, []);
  return (
    <div className="App" style={{ height: "100%" }}>
      <Router align="center">
        <Header />
        <div
          id="alertDiv"
          style={{
            left: "2.5%",
            position: "fixed",
            zIndex: 99999999,
            width: "95%",
            top: 20,
          }}
          align="center"
        ></div>
        <Switch>
          <Route path="/report" component={Report} />
          <Route path="/booking" component={Booking} />
          <Route path="/adminLogin" component={AdminLogin} />
          <Route path="/operatorSignup" component={OperatorSignup} />
          <Route path="/chefSignup" component={ChefSignup} />
          <Route path="/chef/:username" component={ChefEdit} />
          <Route path="/operator/:username" component={OperatorEdit} />
          <Route
            path="/takeOrder"
            component={() => <TakeOrder store={props.store} />}
          />
          <Route path="/listOperators" component={ListOperators} />
          <Route path="/listChef" component={ListChef} />
          <Route path="/registerRFID" component={RegisterRFID} />
          <Route
            path="/manipulateRFID"
            component={() => <ManipulateRFID store={props.store} />}
          />
          <Route path="/bill/:id" component={Bill} />
          <Route
            path="/billList"
            component={() => <BillList store={props.store} />}
          />
          <Route path="/availability" component={Availability} />
          <Route path="/revert" component={Revert} />
          <Route path="/" component={Landing} />
        </Switch>
      </Router>
      <Footer />
    </div>
  );
}

export default App;
