export class State {
  constructor(initialValue) {
    this.value = initialValue;
    this.prevValue = null;
    this.eventTarget = new EventTarget();
  }

  update(payload) {
    if (typeof payload !== "function") {
      this.updateByValue(payload);
    } else {
      this.updateByModifier(payload);
    }
  }

  updateByValue(newValue) {
    const oldValue = this.prevValue = this.value;
    this.value = {
      ...oldValue,
      ...newValue,
    };
    this.eventTarget.dispatchEvent(
      new CustomEvent("update", { detail: [newValue, oldValue] }),
    );
  }

  updateByModifier(modifier) {
    const newValue = modifier(this.value);
    this.updateByValue(newValue);
  }

  onUpdate(onUpdateHandler) {
    this.eventTarget.addEventListener(
      "update",
      ({ detail: [newValue, oldValue] }) => {
        onUpdateHandler(newValue, oldValue);
      },
    );
  }
}
