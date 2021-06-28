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
  const [isLoading, setIsLoading] = useState(false);
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
            if (doc.data().id === currentUser.uid) {
              setMyUserInfo(doc.data());
            }
          }
        });
        data.sort(
          (a, b) =>
            calculateRating(b.ratings, data) - calculateRating(a.ratings, data)
        );
        setUsers(data);
        setIsLoading(false);
      });
    return () => {
      unsubscribeUsers();
    };
  };

  useEffect(() => {
    fetchData();
  }, []);

  const ratingChanged = (user, rating) => {
    const aboveThreshHoldRating =
      rating - calculateRating(user.ratings, users) > 2.5;
    const belowThreshHoldRating =
      calculateRating(user.ratings, users) - rating > 2.5;
    if (belowThreshHoldRating && Object.keys(user.ratings).length > 0) {
      alert("You cannot rate 2.5 below the average rating");
      return;
    }
    if (aboveThreshHoldRating && Object.keys(user.ratings).length > 0) {
      alert("You cannot rate 2.5 above the average rating");
      return;
    }
    setIsLoading(true);
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
        <div className="container">
          <h4 style={{ marginBottom: "30px" }}>Ratings</h4>
          <table className="table table-striped ratings-table">
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
                  <td>{`${user.name} ${user.lastName}`}</td>
                  <td>
                    {user.role === Role.Player ? "Player" : "Goal Keeper"}
                  </td>
                  <td
                    className="rating-stars"
                    style={{ minWidth: "250px", margin: "10px" }}
                  >
                    {!isLoading &&
                      user.id !== currentUser.uid &&
                      myUserInfo.canRate &&
                      user.canRate && (
                        <ReactStars
                          count={10}
                          onChange={(rating) => ratingChanged(user, rating)}
                          size={window.innerWidth < 992 ? 30 : 24}
                          activeColor="#F7C563"
                          color="#dee2e6"
                          isHalf={true}
                          value={
                            user.ratings ? user.ratings[currentUser.uid] : 0
                          }
                        />
                      )}
                    {(!user.canRate || !myUserInfo.canRate) &&
                      user.id !== currentUser.uid && (
                        <span style={{ color: "red" }}>
                          This user can not be rated yet!
                        </span>
                      )}
                    {user.id === currentUser.uid && (
                      <span style={{ color: "red" }}>
                        You cannot rate yourself!
                      </span>
                    )}
                  </td>
                  <td>
                    {user.canRate &&
                      `${calculateRating(user.ratings, users)} (Rated by ${
                        Object.keys(user.ratings).length
                      })`}
                    {!user.canRate && "N/A"}
                  </td>

                  <td>
                    {myUserInfo.isAdmin && (
                      <div className="form-check form-switch">
                        <input
                          checked={user.canRate}
                          onChange={() => toggleCanRate(user)}
                          className="form-check-input"
                          type="checkbox"
                          id="flexSwitchCheckDefault"
                        />
                      </div>
                    )}
                    {!user.canRate && !myUserInfo.isAdmin && "Cannot rate yet!"}
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
