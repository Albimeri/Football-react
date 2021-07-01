import React, { useState, useEffect } from "react";
import { useHistory } from "react-router";
import { useAuth } from "../contexts/AuthContext";
import { generateId, handleOnKeyDownNumeric } from "./CommonHelpers";
import { hoursEnum, Status, Role, Companies } from "../constants/enums";
import firebase from "firebase";
import moment from "moment";

const Admin = () => {
  const { currentUser } = useAuth();
  const [myUserInfo, setMyUserInfo] = useState(null);
  const [matchHour, setMatchHour] = useState(21);
  const [matchDay, setMatchDay] = useState(2);
  const [matchFiled, setMatchFiled] = useState(null);
  const [matchPlayers, setMatchPlayers] = useState(20);
  const [role, setRole] = useState(Role.Player);
  const [rating, setRating] = useState(5);
  const [player, setPlayer] = useState({ name: "", lastName: "" });
  const db = firebase.firestore();

  const updatePlayerNumber = () => {};

  const roles = [
    {
      description: "Player",
      key: 1,
    },
    {
      description: "Goalkeeper",
      key: 2,
    },
  ];

  const savePlayer = () => { 
    if (player.name.trim().length === 0 || rating > 10 || rating < 0) {
      return;
    }
    const id = generateId();
    db.collection("users")
      .doc(id)
      .set({
        status: Status.IN,
        time: moment().format("MM-DD-YYYY hh:mm:ss:SSS A"),
        id,
        name: player.name,
        lastName: player.lastName,
        secretId: Companies.SOLABORATE,
        ratings: { [currentUser.uid]: rating },
        role,
      })
      .then(() => {
        console.log("Status successfully set!");
      })
      .catch((error) => {
        console.error("Error setting status: ", error);
      });
  };

  // currentUser.uid --- my id

  return (
    <div className="container">
      <section className="admin-section-wrapper">
        <h4>Match Information</h4>
        <div className="flex admin-section">
          <div>
            <span>Match hour</span>
            <select
              onChange={(event) => {
                setMatchHour(+event.target.value);
              }}
            >
              {hoursEnum.map((hour) => (
                <option value={hour.key}>{hour.description}</option>
              ))}
            </select>
          </div>

          <div>
            <span>Match Day</span>
            <select
              onChange={(event) => {
                setMatchDay(+event.target.value);
              }}
            >
              {hoursEnum.map((hour) => (
                <option value={hour.key}>{hour.description}</option>
              ))}
            </select>
          </div>
          <div>
            <span>Match Field</span>
            <select
              onChange={(event) => {
                setMatchFiled(+event.target.value);
              }}
            >
              {hoursEnum.map((hour) => (
                <option value={hour.key}>{hour.description}</option>
              ))}
            </select>
          </div>
          <div>
            <span>Match Players No.</span>
            <select
              onChange={(event) => {
                matchPlayers(+event.target.value);
              }}
            >
              {hoursEnum.map((hour) => (
                <option value={hour.key}>{hour.description}</option>
              ))}
            </select>
          </div>
        </div>
        <button className="btn btn-success mt-md-3">Save Match</button>
      </section>

      <section className="pt-md-5 admin-section-wrapper">
        <h4>Add Player</h4>
        <div className="flex admin-section">
          <div>
            <span> First name</span>
            <input
              placeholder="Write player name..."
              onChange={(event) =>
                setPlayer((prevState) => ({
                  ...prevState,
                  name: event.target.value,
                }))
              }
              value={player.name}
            />
          </div>
          <div>
            <span> Last name</span>
            <input
              placeholder="Write player last name..."
              onChange={(event) =>
                setPlayer((prevState) => ({
                  ...prevState,
                  lastName: event.target.value,
                }))
              }
              value={player.lastName}
            />
          </div>
          <div>
            <span>Role</span>
            <select
              onChange={(event) => {
                setRole(+event.target.value);
              }}
            >
              {roles.map((role) => (
                <option value={role.key}>{role.description}</option>
              ))}
            </select>
          </div>

          <div>
            <span>Rating</span>
            <input
              maxLength={2}
              placeholder="Rating"
              type="number"
              min="0"
              onKeyDown={handleOnKeyDownNumeric}
              onChange={(event) => setRating(+event.target.value)}
            />
          </div>
        </div>
        <button className="btn btn-success mt-md-3" onClick={savePlayer}>
          Save Player
        </button>
      </section>
    </div>
  );
};

export default Admin;
