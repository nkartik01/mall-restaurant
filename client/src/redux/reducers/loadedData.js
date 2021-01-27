import { SET } from "../types/loadedData";

const INITIAL_STATE = { hi: "bye" };

const loadedDataReducer = (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case SET:
      return {
        ...state,
        ...action.payload,
      };

    default:
      return state;
  }
};

export default loadedDataReducer;
