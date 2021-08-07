import React, { useRef } from "react";
import styles from "./PasswordSetter.module.css";
import { useHistory } from "react-router";

const PasswordSetter = (props) => {
  const passwordRef = useRef(null);
  const history = useHistory();

  const setPasswordHandler = (e) => {
    e.preventDefault();

    const password = passwordRef.current.value;

    // check the password length is valid(>= 6 and <= 10).
    if (password.length > 10 || password.length < 6) {
      return;
    }

    fetch("http://localhost:8080/change-password", {
      method: "POST",
      headers: new Headers({
        "Authorization": "Bearer " + localStorage.getItem("jwtToken"),
        "Content-Type": "application/json",
      }),
      body: JSON.stringify({
        password: password,
      }),
    })
      .then((res) => {
        if (res.ok) {
          // redirect to personal page
          history.push(`/user/${props.account}`);
        }
      })
      .catch((e) => {
        console.log(e);
      });
  };

  return (
    <form className={styles.center_form}>
      <label htmlFor="newPassword">New Password</label>
      <input type="password" id="newPassword" ref={passwordRef}></input>
      <button onClick={setPasswordHandler}>Confirm</button>
    </form>
  );
};

export default PasswordSetter;
