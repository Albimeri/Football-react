import React, { useState, useEffect } from "react";
import { useHistory } from "react-router";
import { useAuth } from "../contexts/AuthContext";
import { generateId } from "./CommonHelpers";
import firebase from "firebase";
import moment from "moment";
import { Status, Role } from "../constants/enums";

const Header = () => {
  const history = useHistory();
  const { currentUser, logout } = useAuth();
  const [error, setError] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const db = firebase.firestore();

  useEffect(() => {
    fetchAdmins();
  }, []);

  const { pathname } = history.location;

  const fetchAdmins = async () => {
    const unsubscribeOrders = db
      .collection("users")
      .where("isAdmin", "==", true)
      .onSnapshot((querySnapshot) => {
        let admins = [];
        querySnapshot.forEach((doc) => {
          if (doc.exists) {
            const admin = doc.data();
            admins.push(admin);
          }
        });
        setIsAdmin(admins.some((item) => item.id === currentUser.uid));
      });
    return () => {
      unsubscribeOrders();
    };
  };

  const handleLogOut = async () => {
    setError("");
    try {
      await logout();
      history.push("/");
    } catch {
      setError("Failed to logout");
    }
  };
  return (
    <nav
      className="navbar navbar-expand-md navbar-dark bg-dark  "
      style={{ height: "60px" }}
    >
      <div className="container">
        <a
          className={`navbar-brand${pathname === "/" ? " active" : ""}`}
          onClick={() => history.push("/")}
        >
          Home
        </a>
        <a className="navbar-brand" onClick={() => history.push("/user-info")}>
          User Info
        </a>
        <a
          className={`navbar-brand${pathname === "/ratings" ? " active" : ""}`}
          onClick={() => history.push("/ratings")}
        >
          Ratings
        </a>
        {isAdmin && (
          <a
            className={`navbar-brand${pathname === "/admin" ? " active" : ""}`}
            onClick={() => history.push("/admin")}
          >
            Admin
          </a>
        )}
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
