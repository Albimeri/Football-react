import React, { useState, useEffect } from "react";
import { useHistory } from "react-router";
import { useAuth } from "../contexts/AuthContext";
import { generateId } from "./CommonHelpers";
import { hoursEnum } from "../constants/enums";
import firebase from "firebase";
import moment from "moment";

const Admin = () => {
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

  const updatePlayerNumber = () => {
    
  };

  // currentUser.uid --- my id

  return (
    <>
      <section className="jumbotron">
        <h1>Match info</h1>
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
          <span>Match day</span>
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
          <span>Match filed</span>
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
          <span>Match players</span>
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
      </section>

      <section className="jumbotron">
        <h1>Add players</h1>

        <div>
          <input
            placeholder="Player name"
            onChange={(event) => setPlayerName(event.target.value)}
            value={playerName}
          />
        </div>
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

export default Admin;
