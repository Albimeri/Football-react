import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import firebase from "firebase";
import { Role } from "../constants/enums";
import ReactStars from "react-rating-stars-component";
import { calculateRating } from "./CommonHelpers";

const Ratings = () => {
  const { currentUser } = useAuth();
  const [myUserInfo, setMyUserInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [starsVisibility, showStars] = useState(false);
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
        setIsLoading(true);
        data.sort(
          (a, b) =>
            b.canRate - a.canRate ||
            calculateRating(b.ratings, data) - calculateRating(a.ratings, data)
        );
        const filteredData = data.filter((item) => item.email);
        setUsers(filteredData);
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

  const getMyRatingsLength = (ratings) => {
    const whoCanRate = users
      .filter((item) => item.canRate)
      .map((player) => player.id);
    let validRaters = 0;
    whoCanRate.forEach((item) => {
      if (ratings[item]) {
        validRaters += 1;
      }
    });
    return validRaters;
  };

  const toggleCanSetStatus = (user) => {
    db.collection("users")
      .doc(user.id)
      .update({
        ...user,
        canSetStatus: !user.canSetStatus,
      })
      .then(() => {
        console.log("Can set status successfully updated!");
      })
      .catch((error) => {
        console.error("Error can set status: ", error);
      });
  };

  return (
    <>
      {users.length > 0 && (
        <div className="container">
          <div
            className="flex"
            style={{ alignItems: "center", marginBottom: "30px" }}
          >
            <h4>Ratings</h4>
            <button
              style={{ marginLeft: "15px", height: "40px" }}
              onClick={() =>
                showStars((prevStarsVisibility) => !prevStarsVisibility)
              }
              className="btn btn-primary"
            >
              {starsVisibility ? "Hide Ratings" : "Show Ratings"}
            </button>
          </div>
          <table className="table table-striped ratings-table">
            <thead>
              <tr>
                <th scope="col">No.</th>
                <th scope="col">Player</th>
                <th scope="col">Role</th>
                <th scope="col">Rate</th>
                <th scope="col">Rating</th>
                <th scope="col">Can rate</th>
                <th scope="col">Can set status</th>
              </tr>
            </thead>
            <tbody>
              {users
                .filter((item) => item.role === Role.Player)
                .map((user, index) => (
                  <tr className={index < 5 ? "top3" : ""}>
                    <th scope="row">{index + 1}</th>
                    <td>{`${user.name} ${user.lastName}`}</td>
                    <td>
                      {user.role !== Role.Goalkeeper
                        ? `${user.primaryPosition}/${user.secondaryPosition}`
                        : "Goalkeeper"}
                    </td>
                    <td
                      className="rating-stars"
                      style={{ minWidth: "250px", margin: "10px" }}
                    >
                      {!isLoading &&
                        user.id !== currentUser.uid &&
                        myUserInfo.canRate &&
                        user.canRate && (
                          <>
                            {starsVisibility && (
                              <ReactStars
                                count={10}
                                onChange={(rating) =>
                                  ratingChanged(user, rating)
                                }
                                size={window.innerWidth < 992 ? 30 : 24}
                                activeColor="#F7C563"
                                color="#dee2e6"
                                isHalf={true}
                                value={
                                  user.ratings
                                    ? user.ratings[currentUser.uid]
                                    : 0
                                }
                              />
                            )}
                            {!starsVisibility && (
                              <span
                                style={{
                                  color: "#212529",
                                  fontStyle: "italic",
                                }}
                              >
                                Rating visibility: Off
                              </span>
                            )}
                          </>
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
                      {user.canRate && (
                        <>
                          {calculateRating(user.ratings, users)}
                          <span className="rated-by">
                            {" "}
                            Rated by ({getMyRatingsLength(user.ratings)})
                          </span>
                        </>
                      )}
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
                      {!user.canRate && !myUserInfo.isAdmin && (
                        <span style={{ color: "red" }}>Cannot rate yet!</span>
                      )}
                    </td>
                    {myUserInfo.isAdmin && (
                      <td>
                        <div className="form-check form-switch">
                          <input
                            checked={user.canSetStatus}
                            onChange={() => toggleCanSetStatus(user)}
                            className="form-check-input"
                            type="checkbox"
                            id="flexSwitchCheckDefault"
                          />
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              <h4 style={{ marginBottom: "30px", marginTop: "30px" }}>
                Goalkeepers
              </h4>
              {users
                .filter((item) => item.role === Role.Goalkeeper)
                .map((user, index) => (
                  <tr>
                    <th scope="row">{index + 1}</th>
                    <td>{`${user.name} ${user.lastName}`}</td>
                    <td>
                      {user.role !== Role.Goalkeeper
                        ? `${user.primaryPosition}/${user.secondaryPosition}`
                        : "Goalkeeper"}
                    </td>
                    <td
                      className="rating-stars"
                      style={{ minWidth: "250px", margin: "10px" }}
                    >
                      {!isLoading &&
                        user.id !== currentUser.uid &&
                        myUserInfo.canRate &&
                        user.canRate && (
                          <>
                            {starsVisibility && (
                              <ReactStars
                                count={10}
                                onChange={(rating) =>
                                  ratingChanged(user, rating)
                                }
                                size={window.innerWidth < 992 ? 30 : 24}
                                activeColor="#F7C563"
                                color="#dee2e6"
                                isHalf={true}
                                value={
                                  user.ratings
                                    ? user.ratings[currentUser.uid]
                                    : 0
                                }
                              />
                            )}
                            {!starsVisibility && (
                              <span
                                style={{
                                  color: "#212529",
                                  fontStyle: "italic",
                                }}
                              >
                                Rating visibility: Off
                              </span>
                            )}
                          </>
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
                      {!user.canRate && !myUserInfo.isAdmin && (
                        <span style={{ color: "red" }}>Cannot rate yet!</span>
                      )}
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
