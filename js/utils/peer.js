import { state } from "../state/index.js";

let peer;
let peerIntervalTimeGap = 200;

export function initializePeer() {
  peer = new Peer();
  addEventsToPeer(peer);

  setInterval(() => {
    if (peer._disconnected || peer._destroyed) {
      peer = new Peer();
      addEventsToPeer(peer);
    }
  }, peerIntervalTimeGap);
}

function addEventsToPeer(p) {
  p.on("open", id => {
    state.update({
      connection: { type: "connected", id, peer: p },
    });
    peerIntervalTimeGap = 1000;
  });

  p.on("close", () => {
    state.update({
      connection: { type: "retrying", id: null, peer: null },
    });
  });

  p.on("error", () => {
    state.update({
      connection: { type: "retrying", id: null, peer: null },
    });
  });

  window.addEventListener("beforeunload", () => {
    p?._socket?._socket?.close();
  });
}
