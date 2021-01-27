import { combineReducers } from "redux";

import loadedDataReducer from "./reducers/loadedData";

const rootReducer = combineReducers({
  loadedDataReducer,
});

export default rootReducer;
