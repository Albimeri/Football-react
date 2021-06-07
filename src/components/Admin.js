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
  const [matchHour, setMatchHour] = useState(18);
  const db = firebase.firestore();

  // currentUser.uid --- my id

  

  return (
    <select
      onChange={(event) => {
        debugger;
        setMatchHour(+event.target.value);
      }}
    >
      {hoursEnum.map((hour) => (
        <option value={hour.key}>{hour.description}</option>
      ))}
    </select>
  );
};

export default Admin;
