import "./App.css";
import { HashRouter as Router, Route, Switch } from "react-router-dom";
import Landing from "./components/Landing";
import AdminLogin from "./components/AdminLogin";
import PermissionsSetup from "./components/PermissionsSetup";
import OperatorSignup from "./components/OperatorSignup";
import OperatorEdit from "./components/OperatorEdit";
import OperatorLogin from "./components/OperatorLogin";
import ListOperators from "./components/ListOperators";
import TakeOrder from "./components/TakeOrder";
import Header from "./components/Header";
import Footer from "./components/Footer";

function App() {
  return (
    <div className="App" style={{ height: "100%" }}>
      <Header />
      <Router>
        <Switch>
          <Route path="/adminLogin" component={AdminLogin} />
          <Route path="/permissions" component={PermissionsSetup} />
          <Route path="/operatorSignup" component={OperatorSignup} />
          <Route path="/operatorEdit/:username" component={OperatorEdit} />
          <Route path="/operatorLogin" component={OperatorLogin} />
          <Route path="/takeOrder" component={TakeOrder} />
          <Route path="/listOperators" component={ListOperators} />
          <Route path="/" component={Landing} />
        </Switch>
      </Router>
      <Footer />
    </div>
  );
}

export default App;
