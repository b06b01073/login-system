import "./App.css";
import LoginForm from "./components/LoginForm";
import { Switch, Link, Route } from "react-router-dom";
import RegisterForm from "./components/RegisterForm";
import NavBar from "./components/NavBar";

function App() {
  return (
    <div className="main-container">
      {/* <nav className="navbar">navbar</nav>
      <p>main page</p> */}
      <NavBar />
      <Switch>
        <Route path="/register" exact>
          <RegisterForm />
        </Route>
        <Route path="/login" exact>
          <LoginForm />
        </Route>
      </Switch>
    </div>
  );
}

export default App;
