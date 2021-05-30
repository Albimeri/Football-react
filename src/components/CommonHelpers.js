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
