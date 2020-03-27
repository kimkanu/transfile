import { State } from "./State.js";

const initialState = {
  id: null,
  peer: null,
  status: null,
};
export const state = new State(initialState);
