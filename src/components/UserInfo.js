import React, { useState, useEffect } from "react";
import { useHistory } from "react-router";
import { useAuth } from "../contexts/AuthContext";
import { generateId } from "./CommonHelpers";
import { hoursEnum } from "../constants/enums";
import firebase from "firebase";
import moment from "moment";
import { Status, Role, Companies } from "../constants/enums";

const UserInfo = () => {
  const { currentUser } = useAuth();
  const [myUserInfo, setMyUserInfo] = useState(null);
  const [matchHour, setMatchHour] = useState(21);
  const [matchDay, setMatchDay] = useState(2);
  const [matchFiled, setMatchFiled] = useState(null);
  const [matchPlayers, setMatchPlayers] = useState(20);
  const [role, setRole] = useState(1);
  const [rating, setRating] = useState(5);
  const [playerName, setPlayerName] = useState("");
  const db = firebase.firestore();

  // currentUser.uid --- my id

  useEffect(() => {
    db.collection("users")
      .doc(currentUser.uid)
      .get()
      .then((doc) => {
        if (doc.exists) {
          const userInfo = doc.data();
          setMyUserInfo(userInfo);
        }
      })
      .catch((error) => {
        console.log("Error getting document:", error);
      });
  }, [currentUser.uid]);

  //   useEffect(() => {
  //     updateRole(role);
  //   }, [role]);

  const updateRole = (role) => {
    db.collection("users")
      .doc(currentUser.uid)
      .set({
        ...myUserInfo,
        role,
      })
      .then(() => {
        console.log("Role successfully set!");
      })
      .catch((error) => {
        console.error("Error setting role: ", error);
      });
  };

  return (
    <>
      {myUserInfo && (
        <h1>
          Welcome {myUserInfo.name} {myUserInfo.lastName}
        </h1>
      )}
      <section className="jumbotron">
        <h1>Add players</h1>

        <div>
          <input
            placeholder="Player name"
            onChange={(event) => setPlayerName(event.target.value)}
            value={playerName}
          />
        </div>

        <h5> Select your role:</h5>
        <select
          onChange={(event) => { 
            setRole(+event.target.value);
          }}
        >
          <option value={Role.Player}>Player</option>
          <option value={Role.GoalKeeper}>Goal Keeper</option>
        </select>

        <div>
          <span>Role</span>
          <select
            onChange={(event) => {
              setRole(+event.target.value);
            }}
          >
            {hoursEnum.map((hour) => (
              <option value={hour.key}>{hour.description}</option>
            ))}
          </select>
        </div>

        <div>
          <span>Rating</span>
          <select
            onChange={(event) => {
              setRating(+event.target.value);
            }}
          >
            {hoursEnum.map((hour) => (
              <option value={hour.key}>{hour.description}</option>
            ))}
          </select>
        </div>
      </section>
    </>
  );
};

export default UserInfo;
