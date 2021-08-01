import React, { useState } from "react";
import styles from "./Form.module.css";
const isemail = require("isemail");

const RegisterForm = () => {
  const [enteredAccount, setEnteredAccount] = useState("");
  const [entererdPassword, setEnteredPassword] = useState("");
  const [enteredEmail, setEnteredEmail] = useState("");

  const [enteredEmailIsValid, setEnteredEmailIsValid] = useState(false);
  const [enteredAccountIsValid, setEnteredAccountIsValid] = useState(false);
  const [enteredPasswordIsValid, setEnteredPasswordIsValid] = useState(false);

  const [enteredEmailTouched, setEnteredEmailTouch] = useState(false);
  const [enteredAccountTouched, setEnteredAccountTouch] = useState(false);
  const [enteredPasswordTouched, setEnteredPasswordTouch] = useState(false);

  const changeEnteredAccountHandler = (e) => {
    setEnteredAccount(e.target.value);
  };

  const changeEnteredPasswordHandler = (e) => {
    setEnteredPassword(e.target.value);
  };

  const changeEnteredEmailHandler = (e) => {
    setEnteredEmail(e.target.value);
  };

  const registerHandler = (e) => {
    e.preventDefault();
    setEnteredAccountIsValid(true);
    setEnteredEmailIsValid(true);
    setEnteredPasswordIsValid(true);

    setEnteredAccountTouch(true);
    setEnteredEmailTouch(true);
    setEnteredPasswordTouch(true);

    if (!isemail.validate(enteredEmail, { errorLevel: false })) {
      setEnteredEmailIsValid(false);
    }
    if (enteredAccount.length < 6) {
      setEnteredAccountIsValid(false);
    }
    if (entererdPassword.length < 6) {
      setEnteredPasswordIsValid(false);
    }

    if (
      enteredEmailIsValid &&
      enteredAccountIsValid &&
      enteredPasswordIsValid
    ) {
      // send http request
    }
  };

  return (
    <div className={styles.login_form_container}>
      <form className={styles.login_form}>
        <label htmlFor="email" className={styles.label}>
          Email
        </label>
        {enteredEmailIsValid || !enteredEmailTouched || (
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
        {enteredAccountIsValid || !enteredAccountTouched || (
          <p className={styles.error_msg}>
            Length of account must be greater than six.
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
        {enteredPasswordIsValid || !enteredPasswordTouched || (
          <p className={styles.error_msg}>
            Length of password must be greater than six.
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
