import React, { useState, useEffect } from "react";
import { useHistory } from "react-router";
import { useAuth } from "../contexts/AuthContext";
import { generateId } from "./CommonHelpers";
import { hoursEnum, positions } from "../constants/enums";
import firebase from "firebase";
import { Role, Companies } from "../constants/enums";

const UserInfo = () => {
  const { currentUser } = useAuth();
  const [myUserInfo, setMyUserInfo] = useState(null);
  const [selectedRole, setRole] = useState(1);
  const [primaryPosition, setPrimaryPosition] = useState("");
  const [secondaryPosition, setSecondayPosition] = useState("");
  const db = firebase.firestore();

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
  // currentUser.uid --- my id

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
              if (user.primaryPosition || user.secondaryPosition) {
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
    if (
      selectedRole === Role.Player &&
      (!primaryPosition || !secondaryPosition)
    ) {
      return;
    } 
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
                        >
                          {position.description}{" "}
                          {position.role ? `(${position.role})` : position.role}
                        </option>
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
                        >
                          {position.description}{" "}
                          {position.role ? `(${position.role})` : position.role}
                        </option>
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
