import React, { useState } from "react";
import { useHistory } from "react-router";
import styles from "./Form.module.css";
const isemail = require("isemail");

const RegisterForm = (props) => {
  const history = useHistory();

  const [enteredAccount, setEnteredAccount] = useState("");
  const [entererdPassword, setEnteredPassword] = useState("");
  const [enteredEmail, setEnteredEmail] = useState("");

  const [enteredEmailIsValid, setEnteredEmailIsValid] = useState(false);
  const [enteredAccountIsValid, setEnteredAccountIsValid] = useState(false);
  const [enteredPasswordIsValid, setEnteredPasswordIsValid] = useState(false);

  const [showEmailErrorMsg, setShowEmailErrorMsg] = useState(false);
  const [showPasswordErrorMsg, setShowPasswordErrorMsg] = useState(false);
  const [showAccountErrorMsg, setShowAccountErrorMsg] = useState(false);

  const [serverSideErrorMsg, setServerSideErrorMsg] = useState("");

  if (props.account) {
    history.push(`/user/${props.account}`);
  }

  const changeEnteredAccountHandler = (e) => {
    const account = e.target.value;

    setEnteredAccount(account);

    if (account.length >= 6) {
      setEnteredAccountIsValid(true);
    } else {
      setEnteredAccountIsValid(false);
    }
  };

  const changeEnteredPasswordHandler = (e) => {
    const password = e.target.value;

    setEnteredPassword(password);

    if (password.length >= 6) {
      setEnteredPasswordIsValid(true);
    } else {
      setEnteredPasswordIsValid(false);
    }
  };

  const changeEnteredEmailHandler = (e) => {
    const email = e.target.value;
    setEnteredEmail(email);

    if (isemail.validate(email, { errorLevel: false })) {
      setEnteredEmailIsValid(true);
    } else {
      setEnteredEmailIsValid(false);
    }
  };

  const changeShowErrorMsgState = () => {
    if (!enteredEmailIsValid) {
      setShowEmailErrorMsg(true);
    } else {
      setShowEmailErrorMsg(false);
    }

    if (!enteredPasswordIsValid) {
      setShowPasswordErrorMsg(true);
    } else {
      setShowPasswordErrorMsg(false);
    }

    if (!enteredAccountIsValid) {
      setShowAccountErrorMsg(true);
    } else {
      setShowAccountErrorMsg(false);
    }
  };

  const registerHandler = async (e) => {
    e.preventDefault();

    changeShowErrorMsgState();

    if (
      enteredEmailIsValid &&
      enteredAccountIsValid &&
      enteredPasswordIsValid
    ) {
      // send http request

      fetch("http://localhost:8080/register", {
        method: "POST",
        body: JSON.stringify({
          email: enteredEmail,
          account: enteredAccount,
          password: entererdPassword,
        }),
      })
        .then((res) => {
          if (res.ok) {
            props.onSetIsLoggedIn(true);
            props.onSetAccount(enteredAccount);
          }
          return res.json();
        })
        .then((data) => {
          const token = data.token;

          if (token) {
            localStorage.setItem("jwtToken", token);
            history.push(`/user/${enteredAccount}`);
            setServerSideErrorMsg("");
          }

          setServerSideErrorMsg(data.error);
        })
        .catch((e) => console.log("error"));
    }
  };

  return (
    <div className={styles.login_form_container}>
      <form className={styles.login_form}>
        <p className={styles.error_msg}>{serverSideErrorMsg}</p>
        <label htmlFor="email" className={styles.label}>
          Email
        </label>
        {showEmailErrorMsg && (
          <p className={styles.error_msg}>Please enter valid email address.</p>
        )}
        <input
          type="email"
          id="email"
          className={styles.input_box}
          onChange={changeEnteredEmailHandler}
          value={enteredEmail}
        ></input>

        <label htmlFor="account" className={styles.label}>
          Account
        </label>
        {showAccountErrorMsg && (
          <p className={styles.error_msg}>
            Length of account must be greater than five.
          </p>
        )}
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
        {showPasswordErrorMsg && (
          <p className={styles.error_msg}>
            Length of password must be greater than five.
          </p>
        )}
        <input
          type="password"
          id="password"
          className={styles.input_box}
          onChange={changeEnteredPasswordHandler}
          value={entererdPassword}
        ></input>
        <button className={styles.login_button} onClick={registerHandler}>
          Register
        </button>
      </form>
    </div>
  );
};

export default RegisterForm;
