import { CommunicationWrapper } from "./CommunicationWrapper.js";
import { ConnectionWrapper } from "./ConnectionWrapper.js";

export class App {
  constructor($target, globalState) {
    this.$target = $target;
    this.globalState = globalState;

    this.renderInit();
  }

  renderInit() {
    // create DOM objects
    this.$connectionWrapper = document.createElement("div");
    this.$target.appendChild(this.$connectionWrapper);
    this.connectionWrapper = new ConnectionWrapper(
      this.$connectionWrapper,
      this.globalState,
    );

    this.$communicationWrapper = document.createElement("div");
    this.$communicationWrapper.classList.add("communication-wrapper");
    this.communicationWrapper = new CommunicationWrapper(
      this.$communicationWrapper,
      this.globalState,
    );

    // on global state update
    this.globalState.onUpdate(this.onGlobalStateUpdate.bind(this));

    this.$target.appendChild(this.$communicationWrapper);

    // call render function
    this.render();
  }

  onGlobalStateUpdate(newValue, oldValue) {
    this.render();
  }

  render() {}
}
