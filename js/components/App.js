import { CommMgr } from "./CommMgr.js";

export class App {
  constructor($target, globalState) {
    this.$target = $target;
    this.globalState = globalState;

    this.renderInit();
  }

  renderInit() {
    // create DOM objects
    this.$app = document.createElement("div");
    this.$showId = document.createElement("div");
    this.$commMgr = document.createElement("div");
    this.commMgr = new CommMgr(this.$commMgr, this.globalState);

    // on global state update
    this.globalState.onUpdate(this.onGlobalStateUpdate.bind(this));

    this.$target.appendChild(this.$app);
    this.$app.appendChild(this.$showId);
    this.$app.appendChild(this.$commMgr);

    // call render function
    this.render();
  }

  onGlobalStateUpdate(newValue, oldValue) {
    this.render();
  }

  render() {
    const s = this.globalState.value;

    this.$showId.innerHTML = `ID: ${s.id ?? "fetching..."}`;
  }
}
