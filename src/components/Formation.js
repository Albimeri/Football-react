import React, { useState, useEffect } from "react";
import { useHistory } from "react-router";
import { useAuth } from "../contexts/AuthContext";
import Draggable from "react-draggable";
import firebase from "firebase";
import { calculateRatingInPlayers } from "./CommonHelpers";

const Formation = () => {
  const [players, setPlayers] = useState([]);
  const [myUserInfo, setMyUserInfo] = useState(null);
  const { currentUser, logout } = useAuth();
  const histroy = useHistory();
  const db = firebase.firestore();
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedDragable, setSelectedDragable] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const unsubscribeTeams = db
      .collection("teams")
      .onSnapshot((querySnapshot) => {
        let items = [];
        let userInfo = null;
        querySnapshot.forEach((doc) => {
          if (doc.exists) {
            const player = doc.data();
            items.push(player);
            if (player.id === currentUser.uid) {
              userInfo = player;
              setMyUserInfo(player);
            }
          }
        });
        if (items.length === 0 || !userInfo) {
          setPlayers([]);
          return;
        }

        const team = items.filter((item) => userInfo.team === item.team);
        team.sort(
          (a, b) =>
            calculateRatingInPlayers(b.ratings) -
            calculateRatingInPlayers(a.ratings)
        );
        setPlayers(team);
      });
    const unsubscribeAdmins = db
      .collection("users")
      .where("isAdmin", "==", true)
      .onSnapshot((querySnapshot) => {
        let admins = [];
        querySnapshot.forEach((doc) => {
          if (doc.exists) {
            const admin = doc.data();
            admins.push(admin);
          }
        });
        setIsAdmin(admins.some((item) => item.id === currentUser.uid));
      });

    return () => {
      unsubscribeTeams();
      unsubscribeAdmins();
    };
  };

  return (
    <div className="formation-container">
      <h1>{selectedDragable?.x}</h1>
      {players.map((item) => {
        return (
          <Draggable
            key={item.name}
            defaultPosition={{ x: item?.x, y: item?.y }}
          >
            <div className="dragable-item">{item.name}</div>
          </Draggable>
        );
      })}
    </div>
  );
};

export default Formation;
