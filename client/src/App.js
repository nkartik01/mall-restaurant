import "./App.css";
import { HashRouter as Router, Route, Switch } from "react-router-dom";
import Landing from "./components/Landing";
import AdminLogin from "./components/AdminLogin";
import OperatorSignup from "./components/OperatorSignup";
import OperatorEdit from "./components/OperatorEdit";
import OperatorLogin from "./components/OperatorLogin";
import ListOperators from "./components/ListOperators";
import TakeOrder from "./components/TakeOrder";
import Header from "./components/Header";
import Footer from "./components/Footer";
import RegisterRFID from "./components/RegisterRFID";
import ManipulateRFID from "./components/ManipulateRFID";
import BillList from "./components/BillList";

function App(props) {
  return (
    <div className="App" style={{ height: "100%" }}>
      <Router>
        <Header />
        <div id="alertDiv"></div>
        <Switch>
          <Route path="/adminLogin" component={AdminLogin} />
          <Route path="/operatorSignup" component={OperatorSignup} />
          <Route path="/operatorEdit/:username" component={OperatorEdit} />
          <Route path="/operatorLogin" component={() => <OperatorLogin store={props.store} />} />
          <Route path="/takeOrder" component={() => <TakeOrder store={props.store} />} />
          <Route path="/listOperators" component={ListOperators} />
          <Route path="/registerRFID" component={RegisterRFID} />
          <Route path="/manipulateRFID" component={() => <ManipulateRFID store={props.store} />} />
          <Route path="/billList" component={() => <BillList store={props.store} />} />
          <Route path="/" component={Landing} />
        </Switch>
      </Router>
      <Footer />
    </div>
  );
}

export default App;
