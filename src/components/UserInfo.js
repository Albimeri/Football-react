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
  const [selectedRole, setRole] = useState(1);
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

  const roles = [
    {
      description: "Player",
      key: 1,
    },
    {
      description: "GoalKeeper",
      key: 2,
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

                setRole(user.role);
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
        role: selectedRole,
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
        <div className="container">
          <section className="admin-section-wrapper">
            <h4>My Information</h4>
            <div className="flex admin-section">
              <div>
                <h5> Select your role:</h5>
                <select
                  onChange={(event) => {
                    setRole(+event.target.value);
                  }}
                >
                  {roles.map((role) => (
                    <option
                      selected={role.key === selectedRole}
                      value={role.key}
                    >
                      {role.description}
                    </option>
                  ))}
                </select>
              </div>
              {selectedRole === Role.Player && (
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
                </>
              )}
            </div>
            <div>
              <button
                type="button"
                className="btn btn-success"
                onClick={saveMyInfo}
                style={{ margin: "15px 0" }}
              >
                Save my info
              </button>
            </div>
            <div className="flex admin-section">
              <div className="txt-center width-100">
                <h4>A sample of soccer positions</h4>
                <img src="../../../football.png" alt="positions" />
              </div>
            </div>
          </section>
        </div>
      )}
    </>
  );
};

export default UserInfo;
