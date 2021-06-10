import React, { useState, useEffect } from "react";
import { useHistory } from "react-router";
import { useAuth } from "../contexts/AuthContext";
import { generateId } from "./CommonHelpers";
import firebase from "firebase";
import moment from "moment";
import { Status, Role } from "../constants/enums";
import { SelectPlayers } from "../components/SelectPlayers";

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

  const updateInPlayers = () => {
    const batch = db.batch();
    inPlayers.forEach((item) => {
      const toUpdatePlayer = db.collection("users").doc(item.id);
      batch.update(toUpdatePlayer, { status: Status.NOT_SET });
    });
    batch.commit();
  };

  const fetchData = async () => {
    if (!myUserInfo) {
      return;
    }
    const unsubscribeUsers = db
      .collection("users")
      .where("status", "!=", Status.NOT_SET)
      .onSnapshot((querySnapshot) => {
        let users = [];
        querySnapshot.forEach((doc) => {
          if (doc.exists) {
            users.push(doc.data());
          }
        });
        setInPlayers(users);
      });
    return () => {
      unsubscribeUsers();
    };
  };

  const setMyStatus = (status) => {
    db.collection("users")
      .doc(myUserInfo.id)
      .set({
        ...myUserInfo,
        status,
        time: moment().format("M/D/yyyy, h:mm:ss SSS"),
      })
      .then(() => {
        console.log("Status successfully set!");
      })
      .catch((error) => {
        console.error("Error setting status: ", error);
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

        <SelectPlayers
          team1={[
            {
              id: "tes123",
              name: "Alb Imeri",
            },
            {
              id: "112",
              name: "Edon A",
            },
          ]}
          team2={[
            {
              id: "11",
              name: "Kushtrim k",
            },
            {
              id: "te33s123",
              name: "Orion O",
            },
          ]}
        />

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
        <button onClick={updateInPlayers}>Delete in players</button>
      )}
      {error}
    </>
  );
};

export default Home;
