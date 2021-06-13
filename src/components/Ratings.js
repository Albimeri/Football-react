import React, { useState, useEffect } from "react";
import { useHistory } from "react-router";
import { useAuth } from "../contexts/AuthContext";
import { generateId } from "./CommonHelpers";
import firebase from "firebase";
import moment from "moment";
import { Status, Role } from "../constants/enums";
import ReactStars from "react-rating-stars-component";
import { calculateRating } from "./CommonHelpers";

const Ratings = () => {
  const { currentUser } = useAuth();
  const [myUserInfo, setMyUserInfo] = useState(null);
  const [users, setUsers] = useState([]);
  const db = firebase.firestore();

  // currentUser.uid --- my id

  const fetchData = async () => {
    const unsubscribeUsers = db
      .collection("users")
      .onSnapshot((querySnapshot) => {
        let data = [];
        querySnapshot.forEach((doc) => {
          if (doc.exists) {
            data.push(doc.data());
          }
        });

        setUsers(data);
      });
    return () => {
      unsubscribeUsers();
    };
  };

  useEffect(() => {
    fetchData();
  }, []);

  const ratingChanged = (user, rating) => {
    db.collection("users")
      .doc(user.id)
      .update({
        ...user,
        ratings: { ...user.ratings, [currentUser.uid]: rating },
      })
      .then(() => {
        console.log("Rating successfully updated!");
      })
      .catch((error) => {
        console.error("Error updating an order: ", error);
      });
  };

  const toggleCanRate = (user) => {
    db.collection("users")
      .doc(user.id)
      .update({
        ...user,
        canRate: !user.canRate,
      })
      .then(() => {
        console.log("Can rate property successfully updated!");
      })
      .catch((error) => {
        console.error("Error updating an order: ", error);
      });
  };

  const getMyRating = (ratings) => {
    if (!ratings) {
      return 0;
    }
    return ratings[currentUser.uid];
  };

  return (
    <>
      {users.length > 0 && (
        <div>
          <table className="table table-striped">
            <thead>
              <tr>
                <th scope="col">No.</th>
                <th scope="col">Player</th>
                <th scope="col">Role</th>
                <th scope="col">Rate</th>
                <th scope="col">Rating</th>
                <th scope="col">Can rate</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, index) => (
                <tr>
                  <th scope="row">{index + 1}</th>
                  <td>
                    {user.name} {user.lastName}
                  </td>
                  <td>
                    {user.role === Role.Player ? "Player" : "Goal Keeper"}
                  </td>
                  <td>
                    {user.id !== currentUser.uid && user.canRate && (
                      <ReactStars
                        count={10}
                        onChange={(rating) => ratingChanged(user, rating)}
                        size={24}
                        activeColor="#ffd700"
                        isHalf={true}
                        value={getMyRating(user.ratings)}
                      />
                    )}
                    {user.id !== currentUser.uid &&
                      !user.canRate &&
                      "This user can not be rated yet!"}
                    {user.id === currentUser.uid && "You cannot rate yourself!"}
                  </td>
                  <td>
                    {user.canRate &&
                      `${calculateRating(user.ratings)} Rated by ${
                        Object.keys(user.ratings).length
                      }`}
                    {!user.canRate && "N/A"}
                  </td>
                  <td>
                    <div className="form-check form-switch">
                      <input
                        checked={user.canRate}
                        onChange={() => toggleCanRate(user)}
                        className="form-check-input"
                        type="checkbox"
                        id="flexSwitchCheckDefault"
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
};

export default Ratings;
