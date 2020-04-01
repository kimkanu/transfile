import { isConnected } from "../state/connection.js";
import { clearNode } from "../utils/dom.js";

export class ConnectionManager {
  constructor($target, globalState, props = {}) {
    this.$target = $target;
    this.globalState = globalState;
    this.props = props;

    this.renderInit();
  }

  renderInit() {
    // create DOM objects

    // on global state update
    this.globalState.onUpdate(this.onGlobalStateUpdate.bind(this));

    // call render function
    this.render();
  }

  onGlobalStateUpdate(newValue, oldValue) {
    this.render();
  }

  render() {}
}
