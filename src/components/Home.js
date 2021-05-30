import React, { useState, useEffect } from "react";
import { useHistory } from "react-router";
import { useAuth } from "../contexts/AuthContext";
import { generateId } from "./CommonHelpers";
import firebase from "firebase";
import moment from "moment";
import { Status, Role } from "../constants/enums";

const Home = () => {
  const [error, setError] = useState("");
  const [myUserInfo, setMyUserInfo] = useState(null);
  const [role, setRole] = useState(Role.Player);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [inPlayers, setInPlayers] = useState([]);
  const { currentUser, logout } = useAuth();
  const histroy = useHistory();
  const db = firebase.firestore();

  useEffect(() => {
    db.collection("users")
      .doc(currentUser.uid)
      .get()
      .then((doc) => {
        if (doc.exists) {
          const userInfo = doc.data();
          setMyUserInfo(userInfo);
        } else {
          handleLogOut();
        }
      })
      .catch((error) => {
        console.log("Error getting document:", error);
      });
  }, [currentUser.uid]);

  useEffect(() => {
    fetchData();
  }, [myUserInfo]);

  const deleteInPlayers = () => {
    const batch = db.batch();
    inPlayers.forEach((item) => {
      const toRemovePlayer = db.collection("inUsers").doc(item.id);
      batch.delete(toRemovePlayer);
    });
    batch.commit();
  };

  const fetchData = async () => {
    if (!myUserInfo) {
      return;
    }
    const unsubscribeUsers = db
      .collection("inUsers")
      .onSnapshot((querySnapshot) => {
        let users = [];
        querySnapshot.forEach((doc) => {
          if (doc.exists) {
            users.push(doc.data());
          }
        });
        debugger;
        setInPlayers(users);
      });
    return () => {
      unsubscribeUsers();
    };
  };

  const setMyStatus = (status) => {
    debugger;
    db.collection("inUsers")
      .doc(myUserInfo.id)
      .set({
        ...myUserInfo,
        status,
        role,
        time: moment().format("M/D/yyyy, h:mm:ss SSS"),
      })
      .then(() => {
        console.log("Order successfully created!");
      })
      .catch((error) => {
        console.error("Error creating an order: ", error);
      });
  };

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
    <>
      <nav
        className="navbar navbar-expand-md navbar-dark bg-dark  "
        style={{ height: "60px" }}
      >
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

      <div className="pricing-header px-3 py-3 pt-md-5 pb-md-4 mx-auto text-center">
        {!currentUser.emailVerified && (
          <>
            {myUserInfo && (
              <h1 className="display-4">Welcome {myUserInfo.name}</h1>
            )}
            {myUserInfo && (
              <>
                <p className="lead">
                  You just created an account. You should shortly receive an
                  email with the activation link on this email: "
                  {myUserInfo.email}".
                </p>
                <p className="lead">
                  Please activate your account in order to continue.
                </p>
                <button
                  type="button"
                  className="btn btn-primary cursor-pointer"
                  onClick={currentUser.sendEmailVerification}
                >
                  Resend Link
                </button>
              </>
            )}
          </>
        )}

        <div>
          <h2> Next match at (18:00 Tue, 01 Jun)</h2>
          <h2>Location: Fusha Prishtina</h2>
          <h2>What is your status?</h2>
          <h5> Select your role:</h5>
          <select
            onChange={(event) => {
              debugger;
              setRole(+event.target.value);
            }}
          >
            <option value={Role.Player}>Player</option>
            <option value={Role.GoalKeeper}>Goal Keeper</option>
          </select>
          <button
            className="btn btn btn-outline-success"
            onClick={() => setMyStatus(Status.IN)}
          >
            IN
          </button>
          <button
            className="btn btn btn-outline-danger"
            onClick={() => setMyStatus(Status.OUT)}
          >
            Out
          </button>
        </div>
        {inPlayers.length > 0 && (
          <div>
            <table className="table table-striped">
              <thead>
                <tr>
                  <th scope="col">No.</th>
                  <th scope="col">Player</th>
                  <th scope="col">Role</th>
                  <th scope="col">Status</th>
                  <th scope="col">Time</th>
                </tr>
              </thead>
              <tbody>
                {inPlayers.map((player, index) => (
                  <tr>
                    <th scope="row">{index + 1}</th>
                    <td>
                      {player.name} {player.lastName}
                    </td>
                    <td>{player.status === Status.IN ? "In" : "Out"}</td>
                    <td>
                      {player.role === Role.Player ? "Player" : "Goal Keeper"}
                    </td>
                    <td>{player.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {inPlayers.length > 0 && (
        <button onClick={deleteInPlayers}>Delete in players</button>
      )}
      {error}
    </>
  );
};

export default Home;
