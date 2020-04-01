export class FileReceiver {
  constructor($target, globalState, props = {}) {
    this.$target = $target;
    this.globalState = globalState;
    this.props = props;
    this.code = null;

    this.renderInit();
  }

  renderInit() {
    // create DOM objects
    this.$wrapper = document.createElement("div");
    this.$target.appendChild(this.$wrapper);

    this.$title = document.createElement("div");
    this.$wrapper.appendChild(this.$title);

    this.$titleSpan = document.createElement("span");
    this.$titleSpan.classList.add("card-title");
    this.$titleSpan.innerText = "Receive File";
    this.$title.appendChild(this.$titleSpan);

    this.$codeInput = document.createElement("input");
    this.$codeInput.setAttribute("type", "text");
    this.$codeInput.addEventListener("input", e => {
      if (
        this.$codeInput.value.length === 0 ||
        `${this.$codeInput.value}`.match(/^[1-9]\d{0,5}$/)
      ) {
        this.render();
        this.code =
          this.$codeInput.value.length === 0
            ? null
            : parseInt(this.$codeInput.value, 10);
      } else {
        this.$codeInput.value = `${this.code ?? ""}`;
      }
    });
    this.$codeInput.addEventListener("keydown", e => {
      if (e.keyCode === 13) {
        this.receiveFile();
      }
    });
    this.$wrapper.appendChild(this.$codeInput);

    this.$inputDescription = document.createElement("div");
    this.$wrapper.appendChild(this.$inputDescription);

    // on global state update
    this.globalState.onUpdate(this.onGlobalStateUpdate.bind(this));

    // call render function
    this.render();
  }

  receiveFile() {
    if (!this.code) {
      return;
    }
    if (this.code < 100000) {
      return;
    }

    const code = this.code;
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

        this.peerConn = this.globalState.value.connection.peer.connect(
          clientId,
          {
            reliable: true,
          },
        );
        const openHandler = () => {
          this.peerConn.send(false);
        };
        this.peerConn.on("open", openHandler);
        const dataHandler = ({ blob, fileName }) => {
          saveAs(new Blob([blob]), fileName);
          this.peerConn.send(true);
          this.globalState.update({
            communication: {
              type: "nothing",
            },
          });
          this.$codeInput.value = "";
          this.peerConn.off("open", openHandler);
          this.peerConn.off("data", dataHandler);
          setTimeout(() => {
            this.peerConn = null;
          }, 1000);
        };
        this.peerConn.on("data", dataHandler);
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

  onGlobalStateUpdate(newValue, oldValue) {
    this.render();
  }

  render() {
    const s = this.globalState.value;
  }
}
