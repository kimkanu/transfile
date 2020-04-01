import { clearNode } from "../utils/dom.js";
import { Waiting } from "./Waiting.js";
import { isConnected } from "../state/connection.js";
import { isNothing, isWaiting } from "../state/communication.js";

export class CommunicationWrapper {
  constructor($target, globalState, props = {}) {
    this.$target = $target;
    this.globalState = globalState;
    this.props = props;

    this.renderInit();
  }

  renderInit() {
    // create DOM objects
    this.$commStatus = document.createElement("div");

    this.$fileInput = document.createElement("input");
    this.$fileInput.setAttribute("type", "file");
    this.$fileInput.addEventListener("change", () => {
      this.render();
    });

    this.$submitSend = document.createElement("input");
    this.$submitSend.setAttribute("type", "button");
    this.$submitSend.value = "Send!";

    this.$codeInput = document.createElement("input");
    this.$codeInput.setAttribute("type", "number");

    this.$receive = document.createElement("input");
    this.$receive.setAttribute("type", "button");
    this.$receive.value = "Receive!";

    this.$target.appendChild(this.$commStatus);
    this.$target.appendChild(this.$fileInput);
    this.$target.appendChild(this.$submitSend);
    this.$target.appendChild(this.$codeInput);
    this.$target.appendChild(this.$receive);

    // on global state update
    this.globalState.onUpdate(this.onGlobalStateUpdate.bind(this));

    // call render function
    this.render();
  }

  onGlobalStateUpdate(newValue, oldValue) {
    this.render();
  }

  receiveClickHandler(e) {
    const code = parseInt(this.$codeInput.value, 10);
    const queryParams = {
      code,
    };
    const url = new URL(
      "https://us-central1-transfile-c3410.cloudfunctions.net/receiveRequest",
    );
    url.search = new URLSearchParams(queryParams).toString();

    this.globalState.update({
      communication: {
        type: "requesting",
        code,
      },
    });

    fetch(url)
      .then(res => res.json())
      .then(({ clientId }) => {
        this.globalState.update({
          communication: {
            type: "receiving",
            clientId,
          },
        });

        this.peerConn = this.globalState.value.connection.peer.connect(clientId, {
          reliable: true,
        });
        this.peerConn.on("open", () => {
          this.peerConn.send(false);
        });
        this.peerConn.on("data", ({ blob, fileName }) => {
          saveAs(new Blob([blob]), fileName);
          this.peerConn.send(true);
          this.globalState.update({
            communication: {
              type: "nothing",
            },
          });
          this.peerConn = null;
        });
      })
      .catch(e => {
        // TODO: notice to user
        console.error(e);
        this.globalState.update({
          communication: {
            type: "nothing",
          },
        });
      });
  }

  submitSendClickHandler(e) {
    const s = this.globalState.value;

    if (!isConnected(s.connection)) {
      // TODO: inform the user for not having proper id
      return;
    }

    this.globalState.update({
      communication: {
        type: "waiting",
        code: null,
        expireAt: null,
      },
    });

    const queryParams = {
      clientId: s.connection.id,
    };
    const url = new URL(
      "https://us-central1-transfile-c3410.cloudfunctions.net/sendRequest",
    );
    url.search = new URLSearchParams(queryParams).toString();

    fetch(url)
      .then(res => res.json())
      .then(({ code, expireAt }) => {
        this.globalState.update({
          communication: {
            type: "waiting",
            code,
            expireAt,
          },
        });
      })
      .catch(e => {
        // TODO: notice to user
        console.error(e);
        this.globalState.update({
          communication: {
            type: "nothing",
          },
        });
      });

    const peer = this.globalState.value.connection.peer;
    peer.on("connection", conn => {
      conn.on("open", () => {
        conn.send({
          blob: this.$fileInput.files[0],
          fileName: this.$fileInput.files[0].name,
        });
      });
      conn.on("data", completed => {
        if (completed) {
          this.globalState.update({
            communication: {
              type: "nothing",
            },
          });
          this.$fileInput.value = "";
        } else {
          this.globalState.update({
            communication: {
              type: "sending",
              code: s.communication.code,
            },
          });
        }
      });
    });
  }

  render() {
    const s = this.globalState.value;
    const p = this.globalState.prevValue ?? s;

    this.$submitSend.removeEventListener("click", this._submitSendClickHandler);
    this.$submitSend.disabled =
      !isConnected(s.connection) ||
      !isNothing(s.communication) ||
      this.$fileInput.files.length === 0;
    this._submitSendClickHandler = this.submitSendClickHandler.bind(this);
    this.$submitSend.addEventListener("click", this._submitSendClickHandler);

    this.$receive.removeEventListener("click", this._receiveClickHandler);
    this.$receive.disabled =
      !isConnected(s.connection) || !isNothing(s.communication);
    this._receiveClickHandler = this.receiveClickHandler.bind(this);
    this.$receive.addEventListener("click", this._receiveClickHandler);

    if (isWaiting(p.communication) && !isWaiting(s.communication)) {
      this.waiting = null;
    }

    switch (s.communication.type) {
      case "nothing": {
        clearNode(this.$commStatus);

        const textNode = document.createElement("span");
        textNode.innerText = "Nothing to do";
        this.$commStatus.appendChild(textNode);
        break;
      }

      case "waiting": {
        if (!isWaiting(p.communication)) {
          clearNode(this.$commStatus);
          this.waiting = new Waiting(this.$commStatus, this.globalState);
        }
        break;
      }

      default:
        this.$commStatus.innerHTML = s.communication.type;
    }
  }
}
