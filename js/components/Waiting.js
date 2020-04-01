import { isWaiting } from "../state/communication.js";
import { isConnected } from "../state/connection.js";

const MILLISECS_IN_SEC = 1000;

export class Waiting {
  constructor($target, globalState) {
    this.$target = $target;
    this.globalState = globalState;

    this.renderInit();
  }

  renderInit() {
    // create DOM objects
    this.$status = document.createElement("div");
    this.$status.innerText = "Waiting for receiver...";

    this.$code = document.createElement("div");
    this.$timer = document.createElement("div");

    this.$target.appendChild(this.$status);
    this.$target.appendChild(this.$code);
    this.$target.appendChild(this.$timer);

    // on global state update
    this.globalState.onUpdate(this.onGlobalStateUpdate.bind(this));

    // call render function
    this.render();
  }

  onGlobalStateUpdate(newValue, oldValue) {
    this.render();
  }

  cancelTimeout() {
    clearTimeout(this.timeout);
  }

  render() {
    const s = this.globalState.value;
    const p = this.globalState.prevValue;

    if (!isConnected(s.connection)) {
      this.$status.innerText = "Waiting for the server connection...";
      this.$code.innerText = "";
      this.$timer.innerText = "";
      return;
    }

    if (!isWaiting(s.communication)) {
      this.cancelTimeout();
      return;
    }

    // manipulate DOM objects and states
    if (s.communication.code && !this.codeFlag) {
      this.$code.innerText = `${s.communication.code}`;
      this.codeFlag = true;
    } else if (!s.communication.code) {
      this.$code.innerText = "loading...";
    }

    const dateNow = Date.now();
    if (s.communication.expireAt !== null) {
      if (s.communication.expireAt <= dateNow) {
        this.globalState.update({
          communication: {
            type: "nothing",
          },
        });
        return;
      }

      const remainingTimeInSecond =
        Math.ceil(
          (s.communication.expireAt - Date.now() - 100) / MILLISECS_IN_SEC,
        ) - 1;
      this.$timer.innerText = remainingTimeInSecond;
      const untilNearestTick =
        (s.communication.expireAt - Date.now()) % MILLISECS_IN_SEC ||
        MILLISECS_IN_SEC;
      this.timeout = setTimeout(() => {
        this.render();
      }, untilNearestTick);
    }
  }
}
