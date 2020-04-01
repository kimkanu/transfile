import { isConnected } from "../state/connection.js";
import { clearNode } from "../utils/dom.js";

export class ConnectionNoticer {
  constructor($target, globalState, props = {}) {
    this.$target = $target;
    this.globalState = globalState;
    this.props = props;

    this.renderInit();
  }

  renderInit() {
    // create DOM objects
    this.$noticer = document.createElement("div");
    this.$noticer.classList.add("noticer");

    this.$target.appendChild(this.$noticer);

    // on global state update
    this.globalState.onUpdate(this.onGlobalStateUpdate.bind(this));

    // call render function
    this.render();
  }

  onGlobalStateUpdate(newValue, oldValue) {
    this.render();
  }

  render() {
    const s = this.globalState.value;
    const p = this.globalState.prevValue ?? s;

    // manipulate DOM objects and states
    clearNode(this.$noticer);
    if (isConnected(s.connection)) {
      this.$noticer.classList.remove("trying");
      this.$noticer.classList.add("connected");

      const $noticerText = document.createElement("span");
      $noticerText.innerText = "Connected to the server!";
      this.$noticer.appendChild($noticerText);
    } else {
      this.$noticer.classList.remove("connected");
      this.$noticer.classList.add("trying");

      const $noticerText = document.createElement("span");
      const $noticerLoading = document.createElement("div");
      $noticerText.innerText = "Trying to connect...";
      this.$noticer.appendChild($noticerText);
    }
  }
}
