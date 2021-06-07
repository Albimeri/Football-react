import React, { useState, useEffect } from "react";
import { useHistory } from "react-router";
import { useAuth } from "../contexts/AuthContext";
import { generateId } from "./CommonHelpers";
import firebase from "firebase";
import moment from "moment";
import { Status, Role } from "../constants/enums";

const Header = () => {
  const histroy = useHistory();
  const { currentUser, logout } = useAuth();

  const [error, setError] = useState("");
  const handleLogOut = async () => {
    setError("");
    try {
      await logout();
      histroy.push("/");
    } catch {
      setError("Failed to logout");
    }
  };
  return (
    <nav
      className="navbar navbar-expand-md navbar-dark bg-dark  "
      style={{ height: "60px" }}
    >
      <a className="navbar-brand" onClick={() => histroy.push("/")}>
        Home
      </a>
      <a className="navbar-brand" onClick={() => histroy.push("/ratings")}>
        Ratings
      </a>
      <a className="navbar-brand" onClick={() => histroy.push("/admin")}>
        Admin
      </a>
      <div className="collapse navbar-collapse">
        <ul className="navbar-nav mr-auto"></ul>
        <button
          className="btn btn-outline-danger"
          type="button"
          onClick={handleLogOut}
        >
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Header;
