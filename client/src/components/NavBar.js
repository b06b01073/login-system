import React from "react";
import { NavLink } from "react-router-dom";
import styles from "./NavBar.module.css";

const NavBar = (props) => {
  const isLoggedIn = props.isLoggedIn;

  const logoutHandler = () => {
    // clear the token and redirect to home page
    localStorage.removeItem("jwtToken");
    props.onSetIsLoggedIn(false);
    props.onSetAccount("");
  };

  return (
    <div className={styles.navbar_container}>
      <nav>
        <ul>
          {!isLoggedIn && (
            <>
              <li>
                <NavLink to="/login">Login</NavLink>
              </li>
              <li>
                <NavLink to="/register">Regiser</NavLink>
              </li>
            </>
          )}
          {isLoggedIn && (
            <li>
              <NavLink to={`/password/${props.account}`}>
                Change Password
              </NavLink>
              <NavLink to="/" onClick={logoutHandler}>
                Logout
              </NavLink>
            </li>
          )}
        </ul>
      </nav>
    </div>
  );
};

export default NavBar;
