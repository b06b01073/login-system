import React from "react";
import { NavLink } from "react-router-dom";
import styles from "./NavBar.module.css";

const NavBar = () => {
  return (
    <div className={styles.navbar_container}>
      <nav>
        <ul>
          <li>
            <NavLink to="/login">Login</NavLink>
          </li>
          <li>
            <NavLink to="/register">Regiser</NavLink>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default NavBar;
