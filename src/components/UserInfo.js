import React, { useState, useEffect } from "react";
import { useHistory } from "react-router";
import { useAuth } from "../contexts/AuthContext";
import { generateId } from "./CommonHelpers";
import { hoursEnum } from "../constants/enums";
import firebase from "firebase";
import { Role, Companies } from "../constants/enums";

const UserInfo = () => {
  const { currentUser } = useAuth();
  const [myUserInfo, setMyUserInfo] = useState(null);
  const [matchHour, setMatchHour] = useState(21);
  const [matchDay, setMatchDay] = useState(2);
  const [matchFiled, setMatchFiled] = useState(null);
  const [matchPlayers, setMatchPlayers] = useState(20);
  const [role, setRole] = useState(1);
  const [primaryPosition, setPrimaryPosition] = useState("CB");
  const [secondaryPosition, setSecondayPosition] = useState("CM");
  const db = firebase.firestore();

  // currentUser.uid --- my id

  const positions = [
    {
      role: "CB",
      description: "Center Back",
      key: 1,
    },
    {
      role: "LB",
      description: "Left Back",
      key: 2,
    },
    {
      role: "RB",
      description: "Right Back",
      key: 3,
    },
    {
      role: "RWB",
      description: "Left Wing Back",
      key: 32,
    },
    {
      role: "RWB",
      description: "Right Wing Back",
      key: 31,
    },
    {
      role: "DM",
      description: "Defensive Midfielder",
      key: 4,
    },
    {
      role: "CM",
      description: "Center Midfielder",
      key: 5,
    },
    {
      role: "LM",
      description: "Left Midfielder",
      key: 6,
    },
    {
      role: "RM",
      description: "Right Midfielder",
      key: 7,
    },
    {
      role: "LW",
      description: "Left Wing",
      key: 8,
    },
    {
      role: "RW",
      description: "Right Wing",
      key: 9,
    },
    {
      role: "AM",
      description: "Attacker Midfielder",
      key: 10,
    },
    {
      role: "SS",
      description: "Second Striker",
      key: 11,
    },
    {
      role: "CF",
      description: "Center Forward",
      key: 11,
    },
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const unsubscribeUsers = db
      .collection("users")
      .where("secretId", "==", Companies.SOLABORATE)
      .onSnapshot((querySnapshot) => {
        querySnapshot.forEach((doc) => {
          if (doc.exists) {
            const user = doc.data();
            if (user.id === currentUser.uid) {
              setMyUserInfo(user);
              if (user.primaryPosition) {
                setPrimaryPosition(user.primaryPosition);
                setSecondayPosition(user.secondaryPosition);
              }
            }
          }
        });
      });

    return () => {
      unsubscribeUsers();
    };
  };

  const saveMyInfo = () => {
    db.collection("users")
      .doc(myUserInfo.id)
      .set({
        ...myUserInfo,
        primaryPosition,
        secondaryPosition,
      })
      .then(() => {
        console.log("Status successfully set!");
      })
      .catch((error) => {
        console.error("Error setting status: ", error);
      });
  };

  return (
    <>
      {myUserInfo && (
        <div>
          <h1>
            Welcome {myUserInfo.name} {myUserInfo.lastName}
          </h1>
          <h5> Select your role:</h5>
          <select
            onChange={(event) => {
              setRole(+event.target.value);
            }}
          >
            <option value={Role.Player}>Player</option>
            <option value={Role.GoalKeeper}>Goal Keeper</option>
          </select>
          {role === Role.Player && (
            <>
              <div>
                <span>Primary Position</span>
                <select
                  onChange={(event) => {
                    setPrimaryPosition(event.target.value);
                  }}
                >
                  {positions.map((position) => (
                    <option
                      selected={primaryPosition === position.role}
                      value={position.role}
                    >{`${position.description} (${position.role})`}</option>
                  ))}
                </select>
              </div>
              <div>
                <span>Secondary Position</span>
                <select
                  onChange={(event) => {
                    setSecondayPosition(event.target.value);
                  }}
                >
                  {positions.map((position) => (
                    <option
                      selected={secondaryPosition === position.role}
                      value={position.role}
                    >{`${position.description} (${position.role})`}</option>
                  ))}
                </select>
              </div>
              <div>
                <h3>A sample of soccer positions</h3>
                <img src="../../../football.png"></img>
              </div>
            </>
          )}
          <div>
            <button
              type="button"
              className="btn btn-success"
              onClick={saveMyInfo}
            >
              Save my info
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default UserInfo;
