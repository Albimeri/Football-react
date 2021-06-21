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

  const updatePlayerNumber = () => {};

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
            <span>Player</span>
            <input
              placeholder="Write player name..."
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
        </div>
        <button className="btn btn-success mt-md-3">Save Player</button>
      </section>
    </div>
  );
};

export default Admin;
