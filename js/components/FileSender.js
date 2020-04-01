import { clearNode } from "../utils/dom.js";
import { isConnected } from "../state/connection.js";
import { isNothing, isWaiting } from "../state/communication.js";
import { Waiting } from "./Waiting.js";

export class FileSender {
  constructor($target, globalState, props = {}) {
    this.$target = $target;
    this.globalState = globalState;
    this.props = props;

    this.renderInit();
  }

  renderInit() {
    // create DOM objects
    this.$wrapper = document.createElement("div");
    this.$target.appendChild(this.$wrapper);

    document.body.addEventListener("drop", e => {
      if (!isNothing(this.globalState.value.communication)) {
        return;
      }

      e.preventDefault();
      this.$target.classList.remove("extended");

      if (
        e.dataTransfer.items.length > 0 &&
        e.dataTransfer.items[0].kind === "file"
      ) {
        this.globalState.update({
          file: e.dataTransfer.items[0].getAsFile(),
        });
        this.sendFile();
      }
    });
    document.body.addEventListener("dragover", e => {
      if (!isNothing(this.globalState.value.communication)) {
        return;
      }

      e.preventDefault();

      if (
        e.dataTransfer.items.length > 0 &&
        e.dataTransfer.items[0].kind === "file"
      ) {
        this.$target.classList.add("extended");
      } else {
        this.$target.classList.remove("extended");
      }
    });

    this.$wrapper.addEventListener("click", () => {
      if (!isNothing(this.globalState.value.communication)) {
        return;
      }
      this.$target.classList.remove("extended");
      this.$fileInput.click();
    });

    this.$title = document.createElement("div");
    this.$wrapper.appendChild(this.$title);

    this.$titleSpan = document.createElement("span");
    this.$titleSpan.classList.add("card-title");
    this.$titleSpan.innerText = "Send File";
    this.$title.appendChild(this.$titleSpan);

    this.$fileInput = document.createElement("input");
    this.$fileInput.setAttribute("type", "file");
    this.$fileInput.style.visibility = "hidden";
    this.$fileInput.style.height = "0pt";
    this.$fileInput.addEventListener("change", () => {
      if (this.$fileInput.files.length > 0) {
        this.globalState.update({
          file: this.$fileInput.files[0],
        });
        this.sendFile();
      }
    });
    this.$wrapper.appendChild(this.$fileInput);

    this.$content = document.createElement("div");
    this.$wrapper.appendChild(this.$content);

    // on global state update
    this.globalState.onUpdate(this.onGlobalStateUpdate.bind(this));

    // call render function
    this.render();
  }

  onGlobalStateUpdate(newValue, oldValue) {
    this.render();

    if (
      oldValue.connection.peer === null &&
      newValue.connection.peer !== null
    ) {
      if (newValue.file) {
        this.sendFile();
      }
    }
  }

  dropHandler(e) {
    e.preventDefault();
  }

  dragOverHandler(e) {
    e.preventDefault();
  }

  sendFile() {
    const s = this.globalState.value;

    if (!isConnected(s.connection)) {
      // TODO: inform the user for not having proper id
      this.waiting = new Waiting(this.$content, this.globalState);
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
    const handler = conn => {
      conn.on("open", () => {
        conn.send({
          blob: s.file,
          fileName: s.file.name,
        });
      });
      conn.on("data", completed => {
        if (completed) {
          this.globalState.update({
            communication: {
              type: "nothing",
            },
            file: null,
          });
          this.$fileInput.value = "";
          setTimeout(() => {
            peer.off("connection", handler);
          }, 100);
        } else {
          this.globalState.update({
            communication: {
              type: "sending",
              code: s.communication.code,
            },
          });
        }
      });
    };
    peer.on("connection", handler);
  }

  render() {
    const s = this.globalState.value;

    if (isWaiting(s.communication) && !this.waiting) {
      clearNode(this.$content);
      this.waiting = new Waiting(this.$content, this.globalState);
    }
    if (!isWaiting(s.communication) && this.waiting) {
      this.waiting = null;
      clearNode(this.$content);
    }
  }
}
