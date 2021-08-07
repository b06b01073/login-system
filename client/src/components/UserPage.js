import React from "react";
import { useParams } from "react-router";
import styles from "./UserPage.module.css";

const UserPage = () => {
  const { id } = useParams();

  // TODO: add a id pre-check, if no such id exist, redirect to 404 page

  return (
    <div className={styles.centeredMsg}>
      <h1>This is the user page of {id}.</h1>
    </div>
  );
};

export default UserPage;
