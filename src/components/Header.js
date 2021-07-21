import React, { useState, useEffect } from "react";
import { useHistory } from "react-router";
import { useAuth } from "../contexts/AuthContext";
import firebase from "firebase";
import { Role } from "../constants/enums";
import { isMobile } from "react-device-detect";

const Header = () => {
  const history = useHistory();
  const { currentUser, logout } = useAuth();
  const [error, setError] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const db = firebase.firestore();

  useEffect(() => {
    fetchAdmins();
    fetchUsers();
  }, []);

  const { pathname } = history.location;

  const fetchAdmins = async () => {
    const unsubscribeAdmins = db
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
      unsubscribeAdmins();
    };
  };

  const fetchUsers = async () => {
    const unsubscribeUsers = db
      .collection("users")
      .onSnapshot((querySnapshot) => {
        let userData = {};
        querySnapshot.forEach((doc) => {
          if (doc.exists) {
            const userData = doc.data();
            if (
              userData.id === currentUser.uid &&
              !userData.primaryPosition &&
              userData.role === Role.Player
            ) {
              history.push("/user-info");
            }
          }
        });
      });
    return () => {
      unsubscribeUsers();
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
      <div className={`container${isAdmin ? " admin-header" : ""}`}>
        <a
          className={`navbar-brand${pathname === "/" ? " active" : ""}`}
          onClick={() => history.push("/")}
        >
          Home
        </a>
        <a
          className={`navbar-brand${pathname === "/ratings" ? " active" : ""}`}
          onClick={() => history.push("/ratings")}
        >
          Ratings
        </a>
        <a
          className={`navbar-brand${
            pathname === "/user-info" ? " active" : ""
          }`}
          onClick={() => history.push("/user-info")}
        >
          User Info
        </a>
        {!isMobile && (
          <a
            className={`navbar-brand${
              pathname === "/formations" ? " active" : ""
            }`}
            onClick={() => history.push("/formations")}
          >
            Formations
          </a>
        )}
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
