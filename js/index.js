import { App } from "./components/App.js";
import { state } from "./state/index.js";

const app = new App(document.getElementById("app"), state);

let peer = new Peer();
let peerIntervalTimeGap = 200;
setInterval(() => {
  if (peer._disconnected || peer._destroyed) {
    peer = new Peer();
    addEventsToPeer(peer);
  }
}, peerIntervalTimeGap);

addEventsToPeer(peer);

function addEventsToPeer(p) {
  p.on("open", id => {
    console.log("IDDDIDIDI", id);
    state.update({ id, peer });
    peerIntervalTimeGap = 1000;
  });

  p.on("close", () => {
    state.update({ id: null, peer: null });
  });

  p.on("error", () => {
    state.update({ id: null, peer: null });
  });

  window.addEventListener("beforeunload", () => {
    p?._socket?._socket?.close();
  });
}
