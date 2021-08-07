import "./App.css";
import { Switch, Route, Redirect } from "react-router-dom";
import { useState, useEffect } from "react";

import LoginForm from "./components/LoginForm";
import RegisterForm from "./components/RegisterForm";
import NavBar from "./components/NavBar";
import NotFound from "./components/NotFound";
import UserPage from "./components/UserPage";
import PasswordSetter from "./components/PasswordSetter";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [account, setAccount] = useState("");

  // When reload the page, the app need to get the account info by sending the token to the server to get account
  useEffect(() => {
    const token = localStorage.getItem("jwtToken");

    if (token) {
      const fetchAccount = async () => {
        await fetch("http://localhost:8080/get-account", {
          headers: new Headers({
            Authorization: "Bearer " + token,
          }),
        })
          .then((res) => {
            if (res.ok) {
              return res.json();
            } else {
              throw new Error();
            }
          })
          .then((data) => {
            setAccount(data.account);
            setIsLoggedIn(true);
          })
          .catch((e) => {
            console.log(e);
          });
      };

      fetchAccount();
    }
  }, []);

  return (
    <div className="main-container">
      <NavBar
        isLoggedIn={isLoggedIn}
        onSetIsLoggedIn={setIsLoggedIn}
        onSetAccount={setAccount}
        account={account}
      />
      <Switch>
        <Route path="/register" exact>
          <RegisterForm
            onSetAccount={setAccount}
            onSetIsLoggedIn={setIsLoggedIn}
            account={account}
          />
        </Route>
        <Route path="/login" exact>
          <LoginForm
            onSetAccount={setAccount}
            onSetIsLoggedIn={setIsLoggedIn}
            account={account}
          />
        </Route>
        <Route path="/" exact>
          <Redirect to="/login" />
        </Route>
        <Route path="/user/:id">
          <UserPage />
        </Route>

        <Route path="/password/:id">
          <PasswordSetter account={account} />
        </Route>

        <Route path="/*">
          <NotFound />
        </Route>
      </Switch>
    </div>
  );
}

export default App;
