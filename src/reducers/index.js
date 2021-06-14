import userReducer from "./users";
import { combineReducers } from "redux";

const allReducers = combineReducers({ user: userReducer });
export default allReducers;
