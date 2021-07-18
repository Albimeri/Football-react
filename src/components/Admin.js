import React, { useState, useEffect } from "react";
import { useHistory } from "react-router";
import { useAuth } from "../contexts/AuthContext";
import { generateId, handleOnKeyDownNumeric } from "./CommonHelpers";
import {
  hoursEnum,
  Status,
  Role,
  Companies,
  fieldsEnum,
  daysEnum,
  positions,
} from "../constants/enums";
import firebase from "firebase";
import moment from "moment";

const Admin = () => {
  const { currentUser } = useAuth();
  const [myUserInfo, setMyUserInfo] = useState(null);
  const [matchSettings, setMatchSettings] = useState(null);
  const [role, setRole] = useState(Role.Player);
  const [rating, setRating] = useState(5);
  const [player, setPlayer] = useState({ name: "", lastName: "" });
  const db = firebase.firestore();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = () => {
    db.collection("settings")
      .doc("general")
      .get()
      .then((docRef) => {
        const settings = docRef.data();
        setMatchSettings(settings);
      });
  };

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
        primaryPosition: player.primaryPosition,
        secondaryPosition: player.secondaryPosition,
        canRate: true,
      })
      .then(() => {
        console.log("Status successfully set!");
        setPlayer({ name: "", lastName: "" });
      })
      .catch((error) => {
        console.error("Error setting status: ", error);
      });
  };

  const saveMatch = () => {
    if (!matchSettings.playersLimit) {
      return;
    }
    db.collection("settings")
      .doc("general")
      .set(matchSettings)
      .then(() => {
        console.log("Settings successfully set!");
      })
      .catch((error) => {
        console.error("Error setting settings: ", error);
      });
  };

  // currentUser.uid --- my id

  return (
    <>
      {matchSettings && (
        <div className="container">
          <section className="admin-section-wrapper">
            <h4>Match Information</h4>
            <div className="flex admin-section">
              <div>
                <span>Match hour</span>
                <select
                  onChange={(event) => {
                    setMatchSettings((prevState) => ({
                      ...prevState,
                      matchHour: +event.target.value,
                    }));
                  }}
                >
                  {hoursEnum.map((hour) => (
                    <option
                      selected={matchSettings.matchHour === hour.key}
                      value={hour.key}
                    >
                      {hour.description}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <span>Match Day</span>
                <select
                  onChange={(event) => {
                    setMatchSettings((prevState) => ({
                      ...prevState,
                      matchDay: +event.target.value,
                    }));
                  }}
                >
                  {daysEnum.map((day) => (
                    <option
                      selected={matchSettings.matchDay === day.key}
                      value={day.key}
                    >
                      {day.description}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <span>Match Field</span>
                <select
                  onChange={(event) => {
                    setMatchSettings((prevState) => ({
                      ...prevState,
                      matchField: +event.target.value,
                    }));
                  }}
                >
                  {fieldsEnum.map((field) => (
                    <option
                      selected={matchSettings.matchField === field.key}
                      value={field.key}
                    >
                      {field.description}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <span>Player Limit</span>
                <input
                  maxLength={2}
                  placeholder="Player Limit"
                  type="number"
                  min="0"
                  value={matchSettings.playersLimit}
                  onKeyDown={handleOnKeyDownNumeric}
                  onChange={(event) => {
                    setMatchSettings((prevState) => ({
                      ...prevState,
                      playersLimit: +event.target.value,
                    }));
                  }}
                />
              </div>
            </div>
            <button className="btn btn-success mt-md-3" onClick={saveMatch}>
              Save Match
            </button>
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
                <span>Primary Position</span>
                <select
                  onChange={(event) =>
                    setPlayer((prevState) => ({
                      ...prevState,
                      primaryPosition: event.target.value,
                    }))
                  }
                >
                  {positions.map((position) => (
                    <option
                      selected={player.primaryPosition === position.role}
                      value={position.role}
                    >
                      {position.description}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <span>Secondary Position</span>
                <select
                  onChange={(event) =>
                    setPlayer((prevState) => ({
                      ...prevState,
                      secondaryPosition: event.target.value,
                    }))
                  }
                >
                  {positions.map((position) => (
                    <option
                      selected={player.secondaryPosition === position.role}
                      value={position.role}
                    >
                      {position.description}
                    </option>
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
      )}
    </>
  );
};

export default Admin;
