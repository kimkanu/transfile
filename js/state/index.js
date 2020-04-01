import { State } from "./State.js";

const initialState = {
  connection: {
    type: "trying",
    id: null,
    peer: null,
  },
  communication: {
    type: "nothing",
  },
  file: null,
};
export const state = new State(initialState);
