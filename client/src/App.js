import "./App.css";
import { HashRouter as Router, Route, Switch } from "react-router-dom";
import Landing from "./components/Landing";
import AdminLogin from "./components/AdminLogin";
import PermissionsSetup from "./components/PermissionsSetup";
import OperatorSignup from "./components/OperatorSignup";
import OperatorEdit from "./components/OperatorEdit";

function App() {
  return (
    <div className="App">
      <Router>
        <Switch>
          <Route path="/adminLogin" component={AdminLogin} />
          <Route path="/permissions" component={PermissionsSetup} />
          <Route path="/operatorSignup" component={OperatorSignup} />
          <Route path="/operatorEdit/:username" component={OperatorEdit} />
          <Route path="/" component={Landing} />
        </Switch>
      </Router>
    </div>
  );
}

export default App;
