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
import { Status, Role } from "../constants/enums";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

const Home = () => {
  const [error, setError] = useState("");
  const [myUserInfo, setMyUserInfo] = useState(null);
  const [role, setRole] = useState(Role.Player);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [inPlayers, setInPlayers] = useState([]);
  const [teams, setTeams] = useState({
    team1: [],
    team2: [],
  });
  const { currentUser, logout } = useAuth();
  const histroy = useHistory();
  const db = firebase.firestore();

  useEffect(() => {
    db.collection("users")
      .doc(currentUser.uid)
      .get()
      .then((doc) => {
        if (doc.exists) {
          const userInfo = doc.data();
          setMyUserInfo(userInfo);
        } else {
          handleLogOut();
        }
      })
      .catch((error) => {
        console.log("Error getting document:", error);
      });
  }, [currentUser.uid]);

  useEffect(() => {
    fetchData();
  }, [myUserInfo]);

  const updateInPlayers = () => {
    const batch = db.batch();
    inPlayers.forEach((item) => {
      const toUpdatePlayer = db.collection("users").doc(item.id);
      batch.update(toUpdatePlayer, { status: Status.NOT_SET });
    });
    batch.commit();
  };

  const fetchData = async () => {
    if (!myUserInfo) {
      return;
    }
    const unsubscribeUsers = db
      .collection("users")
      .where("status", "!=", Status.NOT_SET)
      .onSnapshot((querySnapshot) => {
        let users = [];
        querySnapshot.forEach((doc) => {
          if (doc.exists) {
            users.push(doc.data());
          }
        });
        setInPlayers(users);
      });
    return () => {
      unsubscribeUsers();
    };
  };

  const setMyStatus = (status) => {
    db.collection("users")
      .doc(myUserInfo.id)
      .set({
        ...myUserInfo,
        status,
        time: moment().format("M/D/yyyy, h:mm:ss SSS"),
      })
      .then(() => {
        console.log("Status successfully set!");
      })
      .catch((error) => {
        console.error("Error setting status: ", error);
      });
  };

  const handleLogOut = async () => {
    setError("");
    try {
      await logout();
      histroy.push("/");
    } catch {
      setError("Failed to logout");
    }
  };

  const saveTeams = () => {
    const batch = db.batch();
    const toSetTeam1 = db.collection("teams").doc(generateId());
    const toSetTeam2 = db.collection("teams").doc(generateId());
    batch.set(toSetTeam1, teams.team1);
    batch.set(toSetTeam2, teams.team2);
    batch.commit();
  };

  const deleteTeams = () => {
    setTeams({
      team1: [],
      team2: [],
    });
  };

  const initTeams = () => {
    let players = inPlayers.filter((player) => player.role === Role.Player);
    let goalKeepers = inPlayers.filter(
      (player) => player.role === Role.GoalKeeper
    );
    // reOrderList(players, "D", "FullDate");
    let limitedPlayersNumber = 12 - goalKeepers.length;
    players = players.splice(
      0,
      players.length > limitedPlayersNumber
        ? limitedPlayersNumber
        : players.length
    );
    goalKeepers.sort((a, b) => {
      let average1 = calculateRating(a.ratings);
      let average2 = calculateRating(b.ratings);
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
      calculateRating(a.ratings) < calculateRating(b.ratings) || +a.Role === 0
        ? 1
        : -1
    );
    const { team1, team2 } = seperatePlayers(players);
    setTeams({ team1, team2 });
    debugger;
  };

  const getTeamAverage = (team, users) => {
    let sum = 0;
    let priviledgedPlayers = team.filter(
      (player) => player.canRate || player.isGuest
    );
    priviledgedPlayers.forEach((player) => {
      let ratingAvg = calculateRating(player.ratings);
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

    background: isDragging ? "lightgreen" : "grey",

    ...draggableStyle,
  });

  const getListStyle = (isDraggingOver) => ({
    background: isDraggingOver ? "lightblue" : "lightgrey",
    padding: grid,
    width: 250,
  });

  // Defining unique ID for multiple lists
  const id2List = {
    droppable: "team1",
    droppable2: "team2",
  };

  const getList = (id) => teams[id2List[id]];

  const onDragEnd = (result) => {
    const { source, destination } = result;

    if (!destination) {
      return;
    }
    debugger;
    // Sorting in same list
    if (source.droppableId === destination.droppableId) {
      const team1 = reorder(
        getList(source.droppableId),
        source.index,
        destination.index
      );

      let state = { team1, team2: teams.team2 };

      if (source.droppableId === "droppable2") {
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
      debugger;
      setTeams({
        team1: result.droppable,
        team2: result.droppable2,
      });
    }
  };

  return (
    <>
      <div className="pricing-header px-3 py-3 pt-md-5 pb-md-4 mx-auto text-center">
        {!currentUser.emailVerified && (
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
        )}
        <div>
          <h2> Next match at (18:00 Tue, 01 Jun)</h2>
          <h2>Location: Fusha Prishtina</h2>
          <h2>What is your status?</h2>
          <h5> Select your role:</h5>
          <select
            onChange={(event) => {
              debugger;
              setRole(+event.target.value);
            }}
          >
            <option value={Role.Player}>Player</option>
            <option value={Role.GoalKeeper}>Goal Keeper</option>
          </select>
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
        <div style={{ display: "flex" }}>
          <DragDropContext onDragEnd={onDragEnd}>
            <div>
              <h1>Team1</h1>
              <Droppable droppableId="droppable">
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
                            {calculateRating(item.ratings)}
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
              {" "}
              <h1>Team2</h1>
              <Droppable droppableId="droppable2">
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
                            {calculateRating(item.ratings)}
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
        {inPlayers.length > 0 && (
          <div>
            <table className="table table-striped">
              <thead>
                <tr>
                  <th scope="col">No.</th>
                  <th scope="col">Player</th>
                  <th scope="col">Role</th>
                  <th scope="col">Status</th>
                  <th scope="col">Time</th>
                </tr>
              </thead>
              <tbody>
                {inPlayers.map((player, index) => (
                  <tr>
                    <th scope="row">{index + 1}</th>
                    <td>
                      {player.name} {player.lastName}
                    </td>
                    <td>{player.status === Status.IN ? "In" : "Out"}</td>
                    <td>
                      {player.role === Role.Player ? "Player" : "Goal Keeper"}
                    </td>
                    <td>{player.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {inPlayers.length > 0 && (
          <div>
            <button
              className="btn btn btn-danger"
              type="button"
              onClick={updateInPlayers}
            >
              Delete in players
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

      {error}
    </>
  );
};

export default Home;
