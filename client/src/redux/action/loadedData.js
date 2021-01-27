import { SET } from "../types/loadedData";

export const setData = (data) => {
  return {
    type: SET,
    payload: data,
  };
};
