import { clearNode } from "../utils/dom.js";
import { Waiting } from "./Waiting.js";

export class CommMgr {
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

    if (oldValue.peer === null && newValue.peer !== null) {
      this.globalState.value.peer.on("connection", conn => {
        conn.on("data", data => {
          console.log(data);
        });
      });
    }
  }

  receiveClickHandler(e) {
    const queryParams = {
      code: this.$codeInput.value,
    };
    const url = new URL(
      "https://us-central1-transfile-c3410.cloudfunctions.net/receiveRequest",
    );
    url.search = new URLSearchParams(queryParams).toString();

    this.globalState.update({
      status: {
        type: "receiving",
        clientId: null,
      },
    });

    fetch(url)
      .then(res => res.json())
      .then(({ clientId }) => {
        this.globalState.update({
          status: {
            type: "receiving",
            clientId,
          },
        });

        this.peerConn = this.globalState.value.peer.connect(clientId, {
          reliable: true,
        });
        this.peerConn.on("open", () => {
          this.peerConn.send(false);
        });
        this.peerConn.on("data", ({ blob, fileName }) => {
          saveAs(new Blob([blob]), fileName);
          this.peerConn.send(true);
          this.globalState.update({ status: null });
          this.peerConn = null;
        });
      });
  }

  submitSendClickHandler(e) {
    const s = this.globalState.value;

    if (!s.id) {
      // TODO: inform the user for not having proper id
      return;
    }

    this.globalState.update({
      status: {
        type: "waiting",
        code: null,
        expireAt: null,
      },
    });

    const queryParams = {
      clientId: s.id,
    };
    const url = new URL(
      "https://us-central1-transfile-c3410.cloudfunctions.net/sendRequest",
    );
    url.search = new URLSearchParams(queryParams).toString();

    fetch(url)
      .then(res => res.json())
      .then(({ code, expireAt }) => {
        this.globalState.update({
          status: {
            type: "waiting",
            code,
            expireAt,
          },
        });
      });

    const peer = this.globalState.value.peer;
    peer.on("connection", conn => {
      conn.on("open", () => {
        conn.send({
          blob: this.$fileInput.files[0],
          fileName: this.$fileInput.files[0].name,
        });
      });
      conn.on("data", completed => {
        if (completed) {
          this.globalState.update({ status: null });
          this.$fileInput.value = "";
        } else {
          this.globalState.update({
            status: {
              type: "sending",
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
    this.$submitSend.disabled = s.id === null || s.status !== null;
    this._submitSendClickHandler = this.submitSendClickHandler.bind(this);
    this.$submitSend.addEventListener("click", this._submitSendClickHandler);

    this.$receive.removeEventListener("click", this._receiveClickHandler);
    this.$receive.disabled = s.id === null || s.status !== null;
    this._receiveClickHandler = this.receiveClickHandler.bind(this);
    this.$receive.addEventListener("click", this._receiveClickHandler);

    if (p.status?.type === "waiting" && s.status?.type !== "waiting") {
      this.waiting = null;
    }

    switch (s.status?.type) {
      case undefined: {
        clearNode(this.$commStatus);

        const textNode = document.createElement("span");
        textNode.innerText = "Nothing to do";
        this.$commStatus.appendChild(textNode);
        break;
      }

      case "waiting": {
        if (p.status?.type !== "waiting") {
          clearNode(this.$commStatus);
          this.waiting = new Waiting(this.$commStatus, this.globalState);
        }
        break;
      }

      default:
        this.$commStatus.innerHTML = s.status.type;
    }
  }
}
