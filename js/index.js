import { App } from "./components/App.js";
import { state } from "./state/index.js";

const app = new App(document.getElementById("app"), state);

const peer = new Peer();

peer.on("open", id => {
  state.update({ id, peer });
});

peer.on("close", () => {
  state.update({ id: null, peer: null });
});

peer.on("error", () => {
  state.update({ id: null, peer: null });
});

window.addEventListener("beforeunload", () => {
  peer?._socket?._socket?.close();
});
