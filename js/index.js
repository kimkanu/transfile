import { App } from "./components/App.js";
import { state } from "./state/index.js";
import { initializePeer } from "./utils/peer.js";

const app = new App(document.getElementById("app"), state);
initializePeer();
