import React, { useState, useEffect } from "react";
import { useHistory } from "react-router";
import { useAuth } from "../contexts/AuthContext";
import {
  generateId,
  calculateRating,
  getPriviledgedUsers,
} from "./CommonHelpers";
import firebase from "firebase";
import moment from "moment";
import { Status, Role, Companies } from "../constants/enums";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

const Home = (props) => {
  const [error, setError] = useState("");
  const [myUserInfo, setMyUserInfo] = useState(null);
  const [role, setRole] = useState(Role.Player);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [inPlayers, setInPlayers] = useState([]);
  const [users, setUsers] = useState([]);
  const [isAdmin, setIsAdmin] = useState([]);
  const [teams, setTeams] = useState({
    team1: [],
    team2: [],
  });
  const { currentUser, logout } = useAuth();
  const histroy = useHistory();
  const db = firebase.firestore();

  useEffect(() => {
    fetchData();
  }, []);

  const updateInPlayers = () => {
    const batch = db.batch();
    inPlayers.forEach((item) => {
      const toUpdatePlayer = db.collection("users").doc(item.id);
      batch.update(toUpdatePlayer, { status: Status.NOT_SET });
    });
    batch.commit();
    deleteTeams();
  };

  const fetchData = async () => {
    const unsubscribeUsers = db
      .collection("users")
      .where("secretId", "==", Companies.SOLABORATE)
      .onSnapshot((querySnapshot) => {
        let users = [];
        querySnapshot.forEach((doc) => {
          if (doc.exists) {
            const user = doc.data();
            if (user.id === currentUser.uid) {
              setMyUserInfo(user);
            }
            users.push(doc.data());
          }
        });
        const filtered = users.filter((item) => item.status !== Status.NOT_SET);
        filtered.sort((a, b) => moment(a.time) - moment(b.time));
        setInPlayers(filtered);
        setUsers(users);
      });
    const unsubscribeTeams = db
      .collection("teams")
      .onSnapshot((querySnapshot) => {
        let items = [];
        querySnapshot.forEach((doc) => {
          if (doc.exists) {
            items.push(doc.data());
          }
        });
        const teams = {
          team1: items.filter((item) => item.team === 1),
          team2: items.filter((item) => item.team === 2),
        };
        setTeams(teams);
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
      unsubscribeUsers();
      unsubscribeTeams();
      unsubscribeAdmins();
    };
  };

  const saveTeams = () => {
    const batch = db.batch();
    const list = teams.team1.concat(teams.team2);
    list.forEach((item) => {
      const toSetPlayer = db.collection("teams").doc(item.id);
      batch.set(toSetPlayer, item);
    });
    batch.commit();
  };

  const deleteTeams = () => {
    const batch = db.batch();
    const list = teams.team1.concat(teams.team2);
    list.forEach((item) => {
      const toDeletePlayer = db.collection("teams").doc(item.id);
      batch.delete(toDeletePlayer, item);
    });
    batch.commit();
    setTeams({ team1: [], team2: [] });
  };

  const initTeams = () => {
    let players = inPlayers.filter((player) => player.role === Role.Player);
    let goalKeepers = inPlayers.filter(
      (player) => player.role === Role.GoalKeeper
    );
    let limitedPlayersNumber = 20;
    players = players.splice(
      0,
      players.length > limitedPlayersNumber
        ? limitedPlayersNumber
        : players.length
    );
    goalKeepers.sort((a, b) => {
      let average1 = calculateRating(a.ratings, users);
      let average2 = calculateRating(b.ratings, users);
      return average1 < average2 ? 1 : -1;
    });
    goalKeepers.forEach((goalKeeper, index) => {
      let team = (index + 1) % 2 === 0 ? 1 : 2;
      goalKeeper.team = team;
      team === 1
        ? team1.players.push(goalKeeper)
        : team2.players.push(goalKeeper);
    });

    players.sort((a, b) =>
      calculateRating(a.ratings, users) < calculateRating(b.ratings, users) ||
      +a.Role === 0
        ? 1
        : -1
    );
    const { team1, team2 } = seperatePlayers(players);
    setTeams({ team1, team2 });
  };

  const getTeamAverage = (team, users) => {
    let sum = 0;
    let priviledgedPlayers = team.filter(
      (player) => player.canRate || player.isGuest
    );
    priviledgedPlayers.forEach((player) => {
      let ratingAvg = calculateRating(player.ratings, users);
      sum += ratingAvg;
    });
    return sum / priviledgedPlayers.length;
  };

  const seperatePlayers = (players) => {
    let team1 = {
      Key: 1,
      playersToAdd: 1,
      players: [],
    };
    let team2 = {
      Key: 2,
      playersToAdd: 2,
      players: [],
    };
    let turnToAdd = 1;
    for (let i = 0; i < players.length; i++) {
      if (turnToAdd === 1) {
        players[i].team = 1;
        if (team1.playersToAdd === 2) {
          if (players.length - 1 === i) {
            team1.players.push(players[i]);
          } else {
            players[i + 1].team = 1;
            team1.players.push(players[i]);
            team1.players.push(players[i + 1]);
            i++;
          }
          team1.playersToAdd = 1;
        } else {
          players[i].team = 1;
          team1.players.push(players[i]);
          team1.playersToAdd = 2;
        }
      }
      if (turnToAdd === 2) {
        if (team2.playersToAdd === 2) {
          players[i].team = 2;
          if (players.length - 1 === i) {
            team2.players.push(players[i]);
          } else {
            players[i + 1].team = 2;
            team2.players.push(players[i]);
            team2.players.push(players[i + 1]);
            i++;
          }
          team2.playersToAdd = 1;
        } else {
          players[i].team = 2;
          team2.players.push(players[i]);
          team2.playersToAdd = 2;
        }
      }
      turnToAdd = turnToAdd === 2 ? 1 : 2;
    }
    // team1.Average = getTeamAverage(team1.players, players);
    // team2.Average = getTeamAverage(team2.players, players);
    return { team1: team1.players, team2: team2.players };
  };

  const reorder = (list, startIndex, endIndex) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);

    return result;
  };

  // Move item from one list to other
  const move = (source, destination, droppableSource, droppableDestination) => {
    const sourceClone = Array.from(source);
    const destClone = Array.from(destination);
    const [removed] = sourceClone.splice(droppableSource.index, 1);
    destClone.splice(droppableDestination.index, 0, removed);
    const result = {};
    result[droppableSource.droppableId] = sourceClone;
    result[droppableDestination.droppableId] = destClone;
    return result;
  };

  const grid = 10;

  const getItemStyle = (isDragging, draggableStyle) => ({
    userSelect: "none",
    padding: grid * 2,
    margin: `0 0 ${grid}px 0`,
    background: "white",
    ...draggableStyle,
  });

  const getListStyle = (isDraggingOver) => ({
    background: isDraggingOver ? "lightblue" : "#ededed",
    padding: grid,
    width: 250,
    minHeight: 94,
  });

  // Defining unique ID for multiple lists
  const id2List = {
    team1: "team1",
    team2: "team2",
  };

  const getList = (id) => teams[id2List[id]];

  const onDragEnd = (result) => {
    const { source, destination } = result;
    if (!destination) {
      return;
    }
    // Sorting in same list
    if (source.droppableId === destination.droppableId) {
      const team1 = reorder(
        getList(source.droppableId),
        source.index,
        destination.index
      );

      let state = { team1, team2: teams.team2 };
      if (source.droppableId === "team2") {
        state = { team2: team1, team1: teams.team1 };
      }
      setTeams(state);
    }
    // Interlist movement
    else {
      const result = move(
        getList(source.droppableId),
        getList(destination.droppableId),
        source,
        destination
      );
      result.team1.forEach((item) => (item.team = 1));
      result.team2.forEach((item) => (item.team = 2));
      setTeams({
        team1: result.team1,
        team2: result.team2,
      });
    }
  };

  const setMyStatus = (status) => {
    db.collection("users")
      .doc(myUserInfo.id)
      .set({
        ...myUserInfo,
        status,
        time: moment().format("MM-DD-YYYY h:mm:ss:SSS"),
      })
      .then(() => {
        console.log("Status successfully set!");
      })
      .catch((error) => {
        console.error("Error setting status: ", error);
      });
  };

  return (
    <div className="container">
      {!currentUser.emailVerified && (
        <div className="pricing-header px-3 py-3 pb-md-4 mx-auto text-center">
          <>
            {myUserInfo && (
              <h1 className="display-4">Welcome {myUserInfo.name}</h1>
            )}
            {myUserInfo && (
              <>
                <p className="lead">
                  You just created an account. You should shortly receive an
                  email with the activation link on this email: "
                  {myUserInfo.email}".
                </p>
                <p className="lead">
                  Please activate your account in order to continue.
                </p>
                <button
                  type="button"
                  className="btn btn-primary cursor-pointer"
                  onClick={currentUser.sendEmailVerification}
                >
                  Resend Link
                </button>
              </>
            )}
          </>
        </div>
      )}
      {currentUser.emailVerified && (
        <>
          <div className="pricing-header px-3 py-3 pb-md-4 mx-auto text-center">
            <h2> Next match at (21:00 Wednesday)</h2>
            <h3>Location: Fusha 2 Korriku</h3>
            <h4>What is your status?</h4>
            <h5> Select your role:</h5>
            <select
              onChange={(event) => {
                setRole(+event.target.value);
              }}
            >
              <option value={Role.Player}>Player</option>
              <option value={Role.GoalKeeper}>Goal Keeper</option>
            </select>
            <div>
              <button
                className="btn btn btn-outline-success"
                onClick={() => setMyStatus(Status.IN)}
              >
                IN
              </button>
              <button
                className="btn btn btn-outline-danger"
                onClick={() => setMyStatus(Status.OUT)}
              >
                Out
              </button>
            </div>
          </div>

          {!isAdmin && (teams.team1.length > 0 || teams.team2.length > 0) && (
            <div className="col-lg-6 mx-auto">
              <div class="d-grid gap-2 d-sm-flex my-md-3 justify-content-sm-center not-admin-teams">
                <div>
                  <h3>Team white</h3>
                  <div
                    style={{
                      background: "rgb(237, 237, 237)",
                      padding: "10px",
                      width: "250px",
                      minHeight: "94px",
                      margin: "10px",
                    }}
                  >
                    {teams.team1.map((item) => (
                      <div
                        style={{
                          userSelect: "none",
                          padding: "20px",
                          margin: "0px 0px 10px",
                          background: "white",
                        }}
                      >
                        {item.name} {item.lastName}{" "}
                        {calculateRating(item.ratings, users)}
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h3>Team Black</h3>
                  <div
                    style={{
                      background: "rgb(24 5 5)",
                      padding: "10px",
                      width: "250px",
                      minHeight: "94px",
                      margin: "10px",
                    }}
                  >
                    {teams.team2.map((item) => (
                      <div
                        style={{
                          userSelect: "none",
                          padding: "20px",
                          margin: "0px 0px 10px",
                          background: "white",
                        }}
                      >
                        {item.name} {item.lastName}{" "}
                        {calculateRating(item.ratings, users)}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {isAdmin && (teams.team1.length > 0 || teams.team2.length > 0) && (
            <div className="col-lg-6 mx-auto">
              <div class="d-grid gap-2 d-sm-flex my-md-3 justify-content-sm-center admin-teams">
                <div style={{ display: "flex" }}>
                  <DragDropContext onDragEnd={onDragEnd}>
                    <div>
                      <h3>Team White</h3>
                      <Droppable droppableId="team1">
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            style={getListStyle(snapshot.isDraggingOver)}
                          >
                            {teams.team1.map((item, index) => (
                              <Draggable
                                key={item.id}
                                draggableId={item.id}
                                index={index}
                              >
                                {(provided, snapshot) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    style={getItemStyle(
                                      snapshot.isDragging,
                                      provided.draggableProps.style
                                    )}
                                  >
                                    {item.name} {item.lastName}{" "}
                                    {calculateRating(item.ratings, users)}
                                  </div>
                                )}
                              </Draggable>
                            ))}
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                    </div>

                    <div>
                      <h3>Team Black</h3>
                      <Droppable droppableId="team2">
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            style={getListStyle(snapshot.isDraggingOver)}
                          >
                            {teams.team2.map((item, index) => (
                              <Draggable
                                key={item.id}
                                draggableId={item.id}
                                index={index}
                              >
                                {(provided, snapshot) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    style={getItemStyle(
                                      snapshot.isDragging,
                                      provided.draggableProps.style
                                    )}
                                  >
                                    {item.name} {item.lastName}{" "}
                                    {calculateRating(item.ratings, users)}
                                  </div>
                                )}
                              </Draggable>
                            ))}
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                    </div>
                  </DragDropContext>
                </div>
              </div>
            </div>
          )}
          {inPlayers.length > 0 && (
            <>
              <h4 style={{ textAlign: "center", marginBottom: "30px" }}>
                In Players:{" "}
                {
                  inPlayers.filter((player) => player.status === Status.IN)
                    .length
                }
              </h4>
              <div class="table-responsive">
                <table class="table table-striped table-sm home-table">
                  <thead>
                    <tr>
                      <th scope="col">No.</th>
                      <th scope="col">Player</th>
                      <th scope="col">Status</th>
                      <th scope="col">Role</th>
                      <th scope="col">Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inPlayers.map((player, index) => (
                      <tr
                        className={player.status === Status.IN ? "in" : "out"}
                      >
                        <th scope="row">{index + 1}</th>
                        <td className="player-name">
                          {player.name} {player.lastName}
                        </td>
                        <td>{player.status === Status.IN ? "IN" : "OUT"}</td>
                        <td>
                          {player.role === Role.Player
                            ? "Player"
                            : "Goalkeeper"}
                        </td>
                        <td>{player.time}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
          {isAdmin && (
            <div className="pricing-header px-3 py-3 pt-md-5 pb-md-4 mx-auto text-center">
              {inPlayers.length > 0 && (
                <div>
                  <button
                    className="btn btn btn-danger"
                    type="button"
                    onClick={updateInPlayers}
                  >
                    Delete IN Players
                  </button>
                  <button
                    className="btn btn btn-default"
                    type="button"
                    onClick={initTeams}
                  >
                    Init Teams
                  </button>
                  <button
                    className="btn btn btn-danger"
                    type="button"
                    onClick={deleteTeams}
                  >
                    Delete Teams
                  </button>
                  <button
                    className="btn btn btn-success"
                    type="button"
                    onClick={saveTeams}
                  >
                    Save Teams
                  </button>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {error}
    </div>
  );
};

export default Home;
