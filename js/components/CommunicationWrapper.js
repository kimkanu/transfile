import { clearNode } from "../utils/dom.js";
import { Waiting } from "./Waiting.js";
import { isConnected } from "../state/connection.js";
import { isNothing, isWaiting } from "../state/communication.js";
import { FileSender } from "./FileSender.js";
import { FileReceiver } from "./FileReceiver.js";

export class CommunicationWrapper {
  constructor($target, globalState, props = {}) {
    this.$target = $target;
    this.globalState = globalState;
    this.props = props;

    this.renderInit();
  }

  renderInit() {
    // create DOM objects
    this.$fileSender = document.createElement("div");
    this.$fileSender.classList.add("file-sender", "card", "hoverable");
    this.fileSender = new FileSender(this.$fileSender, this.globalState);

    this.$fileReceiver = document.createElement("div");
    this.$fileReceiver.classList.add("file-receiver", "card");
    this.fileReceiver = new FileReceiver(this.$fileReceiver, this.globalState);

    this.$target.appendChild(this.$fileSender);
    this.$target.appendChild(this.$fileReceiver);

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

    if (s.communication.type === "nothing") {
      this.$fileSender.classList.add("hoverable");
    } else {
      this.$fileSender.classList.remove("hoverable");
    }

    if (s.communication.type === "waiting" || s.communication.type === "sending") {
      this.$fileReceiver.classList.add("disabled");
    } else {
      this.$fileReceiver.classList.remove("disabled");
    }

    if (s.communication.type === "requesting" || s.communication.type === "receiving") {
      this.$fileSender.classList.add("disabled");
    } else {
      this.$fileSender.classList.remove("disabled");
    }
  }
}
