export class Component {
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

  render() {
    const s = this.globalState.value;
    const p = this.globalState.prevValue ?? s;

    // manipulate DOM objects and states
  }
}
