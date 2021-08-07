import React, { useState } from "react";
import styles from "./Form.module.css";
import { useHistory } from "react-router-dom";

const LoginForm = (props) => {
  const history = useHistory();

  const [enteredAccount, setEnteredAccount] = useState("");
  const [enteredPassword, setEnteredPassword] = useState("");

  const [enteredAccountIsValid, setEnteredAccountIsValid] = useState(false);
  const [enteredPasswordIsValid, setEnteredPasswordIsValid] = useState(false);

  const [showErrorMsg, setShowErrorMsg] = useState(false);

  if (props.account) {
    history.push(`/user/${props.account}`);
  }

  const changeEnteredAccountHandler = (e) => {
    const account = e.target.value;

    setEnteredAccount(account);

    if (account.length >= 6 && account.length <= 10) {
      setEnteredAccountIsValid(true);
    } else {
      setEnteredAccountIsValid(false);
    }
  };

  const changeEnteredPasswordHandler = (e) => {
    const password = e.target.value;

    setEnteredPassword(password);

    if (password.length >= 6 && password.length <= 10) {
      setEnteredPasswordIsValid(true);
    } else {
      setEnteredPasswordIsValid(false);
    }
  };

  const loginHandler = (e) => {
    e.preventDefault();

    if (enteredAccountIsValid && enteredPasswordIsValid) {
      // send http request
      fetch("http://localhost:8080/login", {
        method: "POST",
        body: JSON.stringify({
          account: enteredAccount,
          password: enteredPassword,
        }),
      })
        .then((res) => {
          if (res.ok) {
            setShowErrorMsg(false);
            props.onSetIsLoggedIn(true);
            props.onSetAccount(enteredAccount);
            return res.json();
          } else {
            setShowErrorMsg(true);
            throw new Error();
          }
        })
        .then((data) => {
          const token = data.token;
          localStorage.setItem("jwtToken", token);
          history.push(`/user/${enteredAccount}`);
        })
        .catch((e) => {
          console.log(e);
        });
    } else {
      setShowErrorMsg(true);
    }
  };

  // console.log(showErrorMsg);

  return (
    <div className={styles.login_form_container}>
      <form className={styles.login_form}>
        <label htmlFor="account" className={styles.label}>
          Account
        </label>
        <input
          type="text"
          id="account"
          className={styles.input_box}
          onChange={changeEnteredAccountHandler}
          value={enteredAccount}
        ></input>
        <label htmlFor="password" className={styles.label}>
          Password
        </label>
        <input
          type="password"
          id="password"
          className={styles.input_box}
          onChange={changeEnteredPasswordHandler}
          value={enteredPassword}
        ></input>
        {showErrorMsg && (
          <p className={styles.error_msg}>
            Invalid account or password. Try again!
          </p>
        )}
        <button className={styles.login_button} onClick={loginHandler}>
          Login
        </button>
      </form>
    </div>
  );
};

export default LoginForm;
