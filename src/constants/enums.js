export const Status = {
  NOT_SET: 0,
  IN: 1,
  OUT: 2,
};

export const Role = {
  Player: 1,
  Goalkeeper: 2,
};

export const Companies = {
  SOLABORATE: "s0L@bOr@t3",
  MAYUNE: "mayune",
};

export const keyCodes = {
  MINUS: 189,
  NUMPAD_SUBTRACT: 109,
  NUMPAD_ADD: 107,
  PLUS: 187,
  LETTER_E: 69,
  NUMPAD_MINUS: 109,
  LETTER_A: 65,
  LETTER_Z: 90,
  ENTER: 13,
};

export const hoursEnum = [
  {
    description: "17:00",
    key: 17,
  },
  {
    description: "18:00",
    key: 18,
  },
  {
    description: "19:00",
    key: 19,
  },
  {
    description: "20:00",
    key: 20,
  },
  {
    description: "21:00",
    key: 21,
  },
  {
    description: "22:00",
    key: 22,
  },
  {
    description: "23:00",
    key: 23,
  },
  {
    description: "00:00",
    key: 24,
  },
];

export const fieldsEnum = [
  {
    coordinations: "42.661585, 21.187517",
    description: "Prishtina",
    key: 1,
  },
  {
    coordinations: "42.674183, 21.133837",
    description: "Ylli",
    key: 2,
  },
  {
    coordinations: "42.674183, 21.133837",
    description: "Princi",
    key: 3,
  },
  {
    coordinations: "42.6725468, 21.1351716",
    description: "Arena 2",
    key: 4,
  },
  {
    coordinations: "42.56307580688146, 21.1268960180655",
    description: "Sopa",
    key: 5,
  },
  {
    coordinations: "42.56307580688146, 21.1268960180655",
    description: "2 Korriku",
    key: 6,
  },
];

export const daysEnum = [
  {
    description: "Monday",
    key: 1,
  },
  {
    description: "Tuesday",
    key: 2,
  },
  {
    description: "Wednesday",
    key: 3,
  },
  {
    description: "Thursday",
    key: 4,
  },
  {
    description: "Friday",
    key: 5,
  },
  {
    description: "Saturday",
    key: 6,
  },
  {
    description: "Sunday",
    key: 7,
  },
];

export const positionTypes = { DEFENDER: 1, MIDFIELDER: 2, ATTACKER: 3 };

export const positions = [
  {
    role: "",
    description: "",
    key: 0,
  },
  {
    role: "CB",
    description: "Center Back",
    key: 1,
    type: positionTypes.DEFENDER,
  },
  {
    role: "LB",
    description: "Left Back",
    key: 2,
    type: positionTypes.DEFENDER,
  },
  {
    role: "RB",
    description: "Right Back",
    key: 3,
    type: positionTypes.DEFENDER,
  },
  {
    role: "RWB",
    description: "Left Wing Back",
    key: 32,
    type: positionTypes.DEFENDER,
  },
  {
    role: "RWB",
    description: "Right Wing Back",
    key: 31,
    type: positionTypes.DEFENDER,
  },
  {
    role: "DM",
    description: "Defensive Midfielder",
    key: 4,
    type: positionTypes.MIDFIELDER,
  },
  {
    role: "CM",
    description: "Center Midfielder",
    key: 5,
    type: positionTypes.MIDFIELDER,
  },
  {
    role: "LM",
    description: "Left Midfielder",
    key: 6,
    type: positionTypes.MIDFIELDER,
  },
  {
    role: "RM",
    description: "Right Midfielder",
    key: 7,
    type: positionTypes.MIDFIELDER,
  },
  {
    role: "LW",
    description: "Left Wing",
    key: 8,
    type: positionTypes.ATTACKER,
  },
  {
    role: "RW",
    description: "Right Wing",
    key: 9,
    type: positionTypes.ATTACKER,
  },
  {
    role: "AM",
    description: "Attacker Midfielder",
    key: 10,
    type: positionTypes.MIDFIELDER,
  },
  {
    role: "SS",
    description: "Second Striker",
    key: 11,
    type: positionTypes.ATTACKER,
  },
  {
    role: "CF",
    description: "Center Forward",
    key: 11,
    type: positionTypes.ATTACKER,
  },
];

export const formation442 = [
  { x: 500, y: 0 },
  { x: 650, y: 0 },

  { x: 350, y: 200 },
  { x: 500, y: 200 },
  { x: 650, y: 200 },
  { x: 800, y: 200 },

  { x: 350, y: 400 },
  { x: 500, y: 400 },
  { x: 650, y: 400 },
  { x: 800, y: 400 },
];
