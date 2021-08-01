import React, { useState } from "react";
import styles from "./Form.module.css";

const LoginForm = () => {
  const [enteredAccount, setEnteredAccount] = useState("");
  const [enteredPassword, setEnteredPassword] = useState("");

  const [enteredAccountIsValid, setEnteredAccountIsValid] = useState(false);
  const [enteredPasswordIsValid, setEnteredPasswordIsValid] = useState(false);

  const [enteredAccountTouched, setEnteredAccountTouch] = useState(false);
  const [enteredPasswordTouched, setEnteredPasswordTouch] = useState(false);

  const changeEnteredAccountHandler = (e) => {
    setEnteredAccount(e.target.value);
  };

  const changeEnteredPasswordHandler = (e) => {
    setEnteredPassword(e.target.value);
  };

  const loginHandler = (e) => {
    e.preventDefault();

    setEnteredAccountTouch(true);
    setEnteredPasswordTouch(true);

    setEnteredAccountIsValid(true);
    setEnteredPasswordIsValid(true);

    if (enteredAccount.length < 6) {
      setEnteredAccountIsValid(false);
    }
    if (enteredPassword.length < 6) {
      setEnteredPasswordIsValid(false);
    }

    if (enteredAccountIsValid && enteredPasswordIsValid) {
      // send http request
    }
  };

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
        {enteredPasswordIsValid ||
          enteredAccountIsValid ||
          !enteredPasswordTouched ||
          !enteredAccountTouched || (
            <p>Invalid account or password. Try again!</p>
          )}
        <button className={styles.login_button} onClick={loginHandler}>
          Login
        </button>
      </form>
    </div>
  );
};

export default LoginForm;
