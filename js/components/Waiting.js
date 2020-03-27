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
    const p = this.globalState.prevValue ?? s;

    if (s.status === null) {
      this.cancelTimeout();
      return;
    }

    // manipulate DOM objects and states
    const dateNow = Date.now();

    this.$status.innerText = "Waiting...";
    this.$code.innerText = `Code: ${s.status.code ?? "..."}`;
    this.$timer.innerText = `Expires in: ${
      s.status.expireAt
        ? Math.ceil((s.status.expireAt - dateNow) / MILLISECS_IN_SEC)
        : "..."
    } seconds`;

    if (s.status.expireAt !== null) {
      if (s.status.expireAt <= dateNow) {
        this.globalState.update({ status: null });
        return;
      }
      const untilNearestTick =
        (s.status.expireAt - Date.now()) % MILLISECS_IN_SEC || MILLISECS_IN_SEC;
      this.timeout = setTimeout(() => {
        this.render();
      }, untilNearestTick);
    }
  }
}
