import React from "react";
import Draggable from "react-draggable";

const Formation = () => {
  const players = [
    { name: "Alb Imeri", x: 650, y: 300 },
    { name: "Edon Abdullahu", x: 350, y: 200 },
    { name: "Orion Krasniqi", x: 150, y: 100 },
  ];

  const handleDragStop = (event, dragData) => {
    // debugger;
  };

  return (
    <div className="formation-container">
      {players.map((item) => {
        return (
          <Draggable
            defaultPosition={{ x: item.x, y: item.y }}
            onStop={(event, dragData) => handleDragStop(event, dragData)}
          >
            <div className="dragable-item">{item.name}</div>
          </Draggable>
        );
      })}
    </div>
  );
};

export default Formation;
