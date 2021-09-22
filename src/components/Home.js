import React, { useState, useEffect } from "react";
import { useHistory } from "react-router";
import { useAuth } from "../contexts/AuthContext";
import { calculateRating, calculateRatingInPlayers } from "./CommonHelpers";
import firebase from "firebase";
import moment from "moment";
import {
  Status,
  Role,
  Companies,
  fieldsEnum,
  daysEnum,
  hoursEnum,
  positionTypes,
  positions,
  formation442,
} from "../constants/enums";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

const Home = (props) => {
  const [error, setError] = useState("");
  const [myUserInfo, setMyUserInfo] = useState(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [playersWithStatus, setplayersWithStatus] = useState([]);
  const [users, setUsers] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [matchSettings, setMatchSettings] = useState(null);
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

  const updateplayersWithStatus = () => {
    const batch = db.batch();
    playersWithStatus.forEach((item) => {
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
        setplayersWithStatus(filtered);
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
        if (items.length === 0) {
          setTeams({ team1: [], team2: [] });
          return;
        }
        const team1 = items.filter((item) => item.team === 1);
        const team2 = items.filter((item) => item.team === 2);
        team1.sort(
          (a, b) =>
            calculateRatingInPlayers(b.ratings) -
            calculateRatingInPlayers(a.ratings)
        );
        team2.sort(
          (a, b) =>
            calculateRatingInPlayers(b.ratings) -
            calculateRatingInPlayers(a.ratings)
        );
        const GoalkeeperIndex1 = team1.findIndex(
          (item) => item.role === Role.Goalkeeper
        );
        const GoalkeeperIndex2 = team2.findIndex(
          (item) => item.role === Role.Goalkeeper
        );
        if (GoalkeeperIndex1 !== -1) {
          const [Goalkeeper1] = team1.splice(GoalkeeperIndex1, 1);
          team1.splice(0, 0, Goalkeeper1);
        }
        if (GoalkeeperIndex2 !== -1) {
          const [Goalkeeper2] = team2.splice(GoalkeeperIndex2, 1);
          team2.splice(0, 0, Goalkeeper2);
        }
        setTeams({ team1, team2 });
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
    const unsubscribeSettings = db
      .collection("settings")
      .doc("general")
      .get()
      .then((docRef) => {
        const settings = docRef.data();
        setMatchSettings(settings);
      });

    return () => {
      unsubscribeUsers();
      unsubscribeTeams();
      unsubscribeAdmins();
      unsubscribeSettings();
    };
  };

  const saveTeams = () => {
    const list = teams.team1.concat(teams.team2);
    if (list.length > 0) {
      const deleteBatch = db.batch();
      list.forEach((item) => {
        const toDeletePlayer = db.collection("teams").doc(item.id);
        deleteBatch.delete(toDeletePlayer, item);
      });
      deleteBatch.commit();
    }

    const batch = db.batch();
    teams.team1
      .filter((el) => el.role === Role.Player)
      .forEach((item, index) => {
        const toSetPlayer = db.collection("teams").doc(item.id);
        batch.set(toSetPlayer, {
          ...item,
          x: formation442[index].x,
          y: formation442[index].y,
        });
      });
    teams.team2
      .filter((el) => el.role === Role.Player)
      .forEach((item, index) => {
        const toSetPlayer = db.collection("teams").doc(item.id);
        batch.set(toSetPlayer, {
          ...item,
          x: formation442[index].x,
          y: formation442[index].y,
        });
      });
    const goalkeeper1 = teams.team1.find((el) => el.role === Role.Goalkeeper);
    const goalkeeper2 = teams.team2.find((el) => el.role === Role.Goalkeeper);
    if (goalkeeper1) {
      const toSetPlayer = db.collection("teams").doc(goalkeeper1.id);
      batch.set(toSetPlayer, {
        ...goalkeeper1,
        x: 160,
        y: 460,
      });
    }
    if (goalkeeper2) {
      const toSetPlayer = db.collection("teams").doc(goalkeeper2.id);
      batch.set(toSetPlayer, {
        ...goalkeeper2,
        x: 160,
        y: 460,
      });
    }
    batch.commit();
  };

  const hasRatedAtleast15 = () => {
    let count = 0;
    users.forEach((user) => {
      if (user.ratings[myUserInfo.id]) {
        count++;
      }
    });
    return myUserInfo.canRate ? count >= 15 : true;
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
    let players = playersWithStatus.filter(
      (player) => player.role === Role.Player && player.status === Status.IN
    );
    let Goalkeepers = playersWithStatus.filter(
      (player) => player.role === Role.Goalkeeper && player.status === Status.IN
    );
    players = players.splice(
      0,
      players.length > matchSettings.playersLimit
        ? matchSettings.playersLimit
        : players.length
    );
    Goalkeepers.sort((a, b) => {
      let average1 = calculateRating(a.ratings, users);
      let average2 = calculateRating(b.ratings, users);
      return average1 < average2 ? 1 : -1;
    });

    players.sort((a, b) =>
      calculateRating(a.ratings, users) < calculateRating(b.ratings, users) ||
      +a.Role === 0
        ? 1
        : -1
    );
    const { team1, team2 } = seperatePlayers(players);

    Goalkeepers.forEach((Goalkeeper, index) => {
      let team = (index + 1) % 2 === 0 ? 1 : 2;
      Goalkeeper.team = team;
      team === 1
        ? team1.splice(0, 0, Goalkeeper)
        : team2.splice(0, 0, Goalkeeper);
    });
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
    padding: "10px",
    margin: `0 0 ${grid}px 0`,
    background: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    ...draggableStyle,
  });

  const getItemStyleBlack = (isDragging, draggableStyle) => ({
    userSelect: "none",
    padding: "10px",
    margin: `0 0 ${grid}px 0`,
    background: "black",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    ...draggableStyle,
  });

  const getListStyle = (isDraggingOver) => ({
    background: isDraggingOver ? "black" : "#ededed",
    padding: grid,
    width: 350,
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
    if (!hasRatedAtleast15()) {
      alert("You need to rate at least 15 players that you played with!");
      return;
    }
    if (myUserInfo.role === Role.Player && !myUserInfo.primaryPosition) {
      histroy.push("/user-info");
      return;
    }
    if (myUserInfo.status === status) {
      return;
    }
    db.collection("users")
      .doc(myUserInfo.id)
      .set({
        ...myUserInfo,
        status,
        time: moment().format("MM-DD-YYYY hh:mm:ss:SSS A"),
      })
      .then(() => {
        console.log("Status successfully set!");
      })
      .catch((error) => {
        console.error("Error setting status: ", error);
      });
  };

  const setToOut = (player, status) => {
    if (player.id) {
      db.collection("users")
        .doc(player.id)
        .set({
          ...player,
          status,
          time: moment().format("MM-DD-YYYY hh:mm:ss:SSS A"),
        })
        .then(() => {
          console.log("Status successfully set!");
        })
        .catch((error) => {
          console.error("Error setting status: ", error);
        });
    }
  };

  const getMatchField = () => {
    return fieldsEnum.find((field) => field.key === matchSettings.matchField);
  };

  const getMatchHour = () => {
    return hoursEnum.find((hour) => hour.key === matchSettings.matchHour);
  };

  const getMatchDay = () => {
    return daysEnum.find((day) => day.key === matchSettings.matchDay);
  };

  const removePlayer = (playerId) => {
    db.collection("users")
      .doc(playerId)
      .delete()
      .then(() => {
        console.log("Player successfully deleted!");
      })
      .catch((error) => {
        console.error("Error deleting player: ", error);
      });
  };

  const getRole = (primaryPosition, isWhite) => {
    const role = positions.find(
      (position) => position.role === primaryPosition
    );
    if (!role) {
      return "";
    }
    if (role.type === positionTypes.DEFENDER) {
      return (
        <img
          style={{ height: "18px", marginLeft: "auto" }}
          src={isWhite ? "../../../def-white.png" : "../../../def-black-bg.png"}
          alt="positions"
        />
      );
    }
    if (role.type === positionTypes.MIDFIELDER) {
      return (
        <img
          style={{ height: "18px", marginLeft: "auto" }}
          src={isWhite ? "../../../mid-white.png" : "../../../mid-black-bg.png"}
          alt="positions"
        />
      );
    }
    if (role.type === positionTypes.ATTACKER) {
      return (
        <img
          style={{ height: "18px", marginLeft: "auto" }}
          src={
            isWhite
              ? "../../../attack-white.png"
              : "../../../attack-black-bg.png"
          }
          alt="positions"
        />
      );
    }
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
            <h3>
              Location:{" "}
              {matchSettings && (
                <>
                  {getMatchField().description} ({getMatchHour().description}{" "}
                  {getMatchDay().description})
                </>
              )}
            </h3>
            <h4>What is your status?</h4>
            <div>
              <button
                disabled={myUserInfo?.status === Status.IN}
                className="btn btn btn-outline-success"
                onClick={() => setMyStatus(Status.IN)}
              >
                IN
              </button>
              <button
                disabled={myUserInfo?.status === Status.OUT}
                className="btn btn btn-outline-danger"
                onClick={() => setMyStatus(Status.OUT)}
              >
                Out
              </button>
            </div>
          </div>

          {!isAdmin && (teams.team1.length > 0 || teams.team2.length > 0) && (
            <div className="col-lg-6 mx-auto">
              <div className="d-grid gap-2 d-sm-flex my-md-3 justify-content-sm-center not-admin-teams">
                <div>
                  <h3>
                    Team white - Avg.{" "}
                    {parseFloat(getTeamAverage(teams.team1, users).toFixed(2))}
                  </h3>
                  <div style={getListStyle()}>
                    {teams.team1.map((item) => (
                      <div
                        style={{
                          userSelect: "none",
                          padding: "10px",
                          margin: "0px 0px 10px",
                          background: "white",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                        }}
                      >
                        {`${item.name} ${item.lastName} `}
                        {calculateRating(item.ratings, users)}
                        {item.role === Role.Goalkeeper
                          ? " (GK)"
                          : ` (${item.primaryPosition}/${item.secondaryPosition})`}
                        {getRole(item.primaryPosition, true)}
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h3>
                    Team Black - Avg.{" "}
                    {parseFloat(getTeamAverage(teams.team2, users).toFixed(2))}
                  </h3>
                  <div style={getListStyle()}>
                    {teams.team2.map((item) => (
                      <div
                        style={{
                          userSelect: "none",
                          padding: "10px",
                          margin: "0px 0px 10px",
                          background: "black",
                          color: "white",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                        }}
                      >
                        {`${item.name} ${item.lastName} `}
                        {calculateRating(item.ratings, users)}
                        {item.role === Role.Goalkeeper
                          ? " (GK)"
                          : ` (${item.primaryPosition}/${item.secondaryPosition})`}
                        {getRole(item.primaryPosition, false)}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {isAdmin && (teams.team1.length > 0 || teams.team2.length > 0) && (
            <div className="col-lg-6 mx-auto">
              <div className="d-grid gap-2 d-sm-flex my-md-3 justify-content-sm-center admin-teams">
                <div style={{ display: "flex" }}>
                  <DragDropContext onDragEnd={onDragEnd}>
                    <div>
                      <h3>
                        Team White - Avg.{" "}
                        {parseFloat(
                          getTeamAverage(teams.team1, users).toFixed(2)
                        )}
                      </h3>
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
                                    {`${item.name} ${item.lastName} `}
                                    {calculateRating(item.ratings, users)}
                                    {item.role === Role.Goalkeeper
                                      ? " (GK)"
                                      : ` (${item.primaryPosition}/${item.secondaryPosition})`}
                                    {getRole(item.primaryPosition, true)}
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
                      <h3>
                        Team Black - Avg.{" "}
                        {parseFloat(
                          getTeamAverage(teams.team2, users).toFixed(2)
                        )}
                      </h3>
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
                                    style={getItemStyleBlack(
                                      snapshot.isDragging,
                                      provided.draggableProps.style
                                    )}
                                  >
                                    {`${item.name} ${item.lastName} `}
                                    {calculateRating(item.ratings, users)}
                                    {item.role === Role.Goalkeeper
                                      ? " (GK)"
                                      : ` (${item.primaryPosition}/${item.secondaryPosition})`}
                                    {getRole(item.primaryPosition, false)}
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
          {isAdmin && (
            <div className="text-center init-teams">
              <div>
                <button
                  className="btn btn btn-default"
                  type="button"
                  onClick={initTeams}
                >
                  Init Teams
                </button>
                {teams.team1.length > 0 && (
                  <>
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
                  </>
                )}
              </div>
            </div>
          )}
          {playersWithStatus.filter((user) => user.status === Status.IN)
            .length > 0 && (
            <>
              <h4 style={{ textAlign: "center", marginBottom: "30px" }}>
                In Players:{" "}
                {
                  playersWithStatus.filter(
                    (player) => player.status === Status.IN
                  ).length
                }
              </h4>
              <div className="table-responsive">
                <table className="table table-striped table-sm home-table">
                  <thead>
                    <tr>
                      <th scope="col">No.</th>
                      <th scope="col">Player</th>
                      <th scope="col">Role</th>
                      <th scope="col">Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {playersWithStatus
                      .filter(
                        (user) =>
                          user.status === Status.IN &&
                          user.role === Role.Goalkeeper
                      )
                      .map((player, index) => (
                        <tr
                          className={
                            player.status === Status.IN && 2 > index
                              ? "in"
                              : "out"
                          }
                        >
                          <td className="player-name flex">
                            <div style={{ width: "35px" }}>{index + 1}</div>
                            {isAdmin && player.id && (
                              <button
                                style={{
                                  marginLeft: "5px",
                                  fontSize: "12px",
                                  width: "75px",
                                }}
                                className={`btn${
                                  player.status === Status.IN
                                    ? " btn-outline-danger"
                                    : " btn-outline-success"
                                }`}
                                onClick={() =>
                                  setToOut(
                                    player,
                                    player.status === Status.IN
                                      ? Status.OUT
                                      : Status.IN
                                  )
                                }
                              >
                                SET {player.status === Status.IN ? "OUT" : "IN"}
                              </button>
                            )}
                          </td>
                          <td scope="row">
                            {" "}
                            {`${player.name} ${player.lastName}`}
                          </td>
                          <td>
                            {player.role !== Role.Player
                              ? "Goalkeeper"
                              : `${player.primaryPosition}/${player.secondaryPosition}`}
                          </td>
                          <td>{player.time}</td>
                        </tr>
                      ))}
                    {playersWithStatus
                      .filter(
                        (item) =>
                          item.role === Role.Player && item.status === Status.IN
                      )
                      .map((player, index) => (
                        <tr
                          className={
                            player.status === Status.IN &&
                            matchSettings?.playersLimit > index
                              ? "in"
                              : "out"
                          }
                        >
                          <td className="player-name flex">
                            <div style={{ width: "35px" }}>{index + 1}</div>
                            {isAdmin && player.id && (
                              <button
                                style={{
                                  marginLeft: "5px",
                                  fontSize: "12px",
                                  width: "75px",
                                }}
                                className={`btn${
                                  player.status === Status.IN
                                    ? " btn-outline-danger"
                                    : " btn-outline-success"
                                }`}
                                onClick={() =>
                                  setToOut(
                                    player,
                                    player.status === Status.IN
                                      ? Status.OUT
                                      : Status.IN
                                  )
                                }
                              >
                                SET {player.status === Status.IN ? "OUT" : "IN"}
                              </button>
                            )}
                          </td>
                          <td className="player-name  ">
                            {`${player.name} ${player.lastName}`}
                          </td>
                          <td>
                            {player.role !== Role.Player
                              ? "Goalkeeper"
                              : `${player.primaryPosition}/${player.secondaryPosition}`}
                          </td>
                          <td className="flex">
                            {player.time}
                            {!player.email && isAdmin && (
                              <button
                                onClick={() => removePlayer(player.id)}
                                className={"btn btn-outline-danger"}
                                style={{
                                  marginLeft: "5px",
                                  fontSize: "12px",
                                  width: "75px",
                                }}
                              >
                                Remove
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
          {playersWithStatus.filter((user) => user.status === Status.OUT)
            .length > 0 && (
            <>
              <h4 style={{ textAlign: "center", marginBottom: "30px" }}>
                Out Players:{" "}
                {
                  playersWithStatus.filter(
                    (player) => player.status === Status.OUT
                  ).length
                }
              </h4>
              <div className="table-responsive">
                <table className="table table-striped table-sm home-table">
                  <thead>
                    <tr>
                      <th scope="col">No.</th>
                      <th scope="col">Player</th>
                      <th scope="col">Role</th>
                      <th scope="col">Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {playersWithStatus
                      .filter((user) => user.status === Status.OUT)
                      .map((player, index) => (
                        <tr
                          className={player.status === Status.IN ? "in" : "out"}
                        >
                          <td className="flex">
                            <div style={{ width: "35px" }}>{index + 1}</div>
                            {isAdmin && player.id && (
                              <button
                                style={{
                                  marginLeft: "5px",
                                  fontSize: "12px",
                                  width: "75px",
                                }}
                                className={`btn${
                                  player.status === Status.IN
                                    ? " btn-outline-danger"
                                    : " btn-outline-success"
                                }`}
                                onClick={() =>
                                  setToOut(
                                    player,
                                    player.status === Status.IN
                                      ? Status.OUT
                                      : Status.IN
                                  )
                                }
                              >
                                SET {player.status === Status.IN ? "OUT" : "IN"}
                              </button>
                            )}
                          </td>
                          <td className="player-name">
                            {`${player.name} ${player.lastName}`}
                          </td>

                          <td>
                            {player.role !== Role.Player
                              ? "Goalkeeper"
                              : `${player.primaryPosition}/${player.secondaryPosition}`}
                          </td>
                          <td className="flex">
                            {player.time}
                            {!player.email && isAdmin && (
                              <button
                                onClick={() => removePlayer(player.id)}
                                className={"btn btn-outline-danger"}
                                style={{
                                  marginLeft: "5px",
                                  fontSize: "12px",
                                  width: "75px",
                                }}
                              >
                                Remove
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
          {isAdmin && (
            <div className="pricing-header px-3 py-3 pt-md-5 pb-md-4 mx-auto text-center">
              {playersWithStatus.length > 0 && (
                <div>
                  <button
                    className="btn btn btn-danger"
                    type="button"
                    onClick={updateplayersWithStatus}
                  >
                    Delete IN Players
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
