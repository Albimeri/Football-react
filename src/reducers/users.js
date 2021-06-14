const userReducer = (state = [{ name: "test" }], action) => {
  switch (action.type) {
    case "SET_USERS": {
      return state;
    }
  }
};
