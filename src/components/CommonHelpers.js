import { KeyCodes } from "../constants/enums";
export const generateId = () => {
  return "_" + Math.random().toString(36).substr(2, 9);
};

export const handleOnKeyDownNumeric = (event) => {
  if (
    [
      KeyCodes.MINUS,
      KeyCodes.NUMPAD_PERIOD,
      KeyCodes.NUMPAD_ADD,
      KeyCodes.NUMPAD_SUBTRACT,
      KeyCodes.PERIOD,
      KeyCodes.PLUS,
      KeyCodes.LETTER_E,
    ].includes(event.which)
  ) {
    event.preventDefault();
  }
};

export const calculateRating = (ratings) => {
  let sum = 0;
  const ratingsArr = Object.values(ratings);
  ratingsArr.forEach((item) => (sum += item));
  return sum / ratingsArr.length;
};

export const getPriviledgedUsers = (users) => {
  return users.filter((item) => item.canRate);
};
