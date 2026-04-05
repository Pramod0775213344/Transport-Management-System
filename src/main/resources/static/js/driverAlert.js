const DriverAlert = {
  overlay: null,
  closeTimeout: null,

  init() {
    if (!document.querySelector(".ios-alert-overlay")) {
      this.overlay = document.createElement("div");
      this.overlay.className = "ios-alert-overlay";
      document.body.appendChild(this.overlay);
    } else {
      this.overlay = document.querySelector(".ios-alert-overlay");
    }
  },

  show({
    title = "",
    text = "",
    icon = "fa-circle-info",
    type = "info",
    buttons = [],
    showInput = false,
    placeholder = "",
    inputType = "text",
  }) {
    this.init();

    if (this.closeTimeout) {
      clearTimeout(this.closeTimeout);
      this.closeTimeout = null;
    }

    const alertBox = document.createElement("div");
    alertBox.className = "ios-alert-box";

    let footerHtml = "";
    // Most important button (primary/danger) should be at the top in vertical layout
    const sortedButtons = [...buttons].sort((a, b) =>
      b.type === "primary" || b.type === "danger" ? -1 : 1,
    );

    sortedButtons.forEach((btn) => {
      footerHtml += `<button class="ios-alert-btn ${btn.type || ""}" id="alert-btn-${btn.id}">${btn.text}</button>`;
    });

    alertBox.innerHTML = `
            <div class="ios-alert-header">
                <div class="ios-alert-icon ${type}">
                    <i class="fa-solid ${icon}"></i>
                </div>
            </div>
            <div class="ios-alert-body">
                ${title ? `<div class="ios-alert-title">${title}</div>` : ""}
                <div class="ios-alert-text">${text}</div>
                ${
                  showInput
                    ? `<input type="${inputType}" id="ios-alert-input" class="ios-alert-input" placeholder="${placeholder}" autofocus>`
                    : ""
                }
            </div>
            <div class="ios-alert-footer">
                ${footerHtml}
            </div>
        `;

    this.overlay.innerHTML = "";
    this.overlay.appendChild(alertBox);
    this.overlay.style.display = "flex";

    if (showInput) {
      setTimeout(() => {
        document.getElementById("ios-alert-input").focus();
      }, 100);
    }

    setTimeout(() => {
      this.overlay.classList.add("active");
    }, 10);

    return new Promise((resolve) => {
      buttons.forEach((btn) => {
        const element = document.getElementById(`alert-btn-${btn.id}`);
        if (element) {
          element.addEventListener("click", () => {
            const inputValue = showInput
              ? document.getElementById("ios-alert-input").value
              : null;

            if (btn.id === "confirm" && showInput && !inputValue) {
              document.getElementById("ios-alert-input").classList.add("error");
              return;
            }

            this.close();
            setTimeout(() => resolve({ id: btn.id, value: inputValue }), 50);
          });
        }
      });
    });
  },

  success(title, text) {
    return this.show({
      title: title,
      text: text,
      type: "success",
      icon: "fa-circle-check",
      buttons: [{ id: "ok", text: "Great!", type: "primary" }],
    }).then((res) => res.id);
  },

  warning(title, text) {
    return this.show({
      title: title,
      text: text,
      type: "warning",
      icon: "fa-triangle-exclamation",
      buttons: [{ id: "ok", text: "Understood", type: "primary" }],
    }).then((res) => res.id);
  },

  alert(title, text) {
    return this.show({
      title: title,
      text: text,
      type: "info",
      icon: "fa-circle-info",
      buttons: [{ id: "ok", text: "OK", type: "primary" }],
    }).then((res) => res.id);
  },

  confirm(title, text, confirmText = "Confirm", cancelText = "Cancel") {
    return this.show({
      title: title,
      text: text,
      type: "info",
      icon: "fa-circle-question",
      buttons: [
        { id: "confirm", text: confirmText, type: "primary" },
        { id: "cancel", text: cancelText, type: "cancel" },
      ],
    }).then((res) => res.id);
  },

  dangerConfirm(title, text, confirmText = "Delete", cancelText = "Cancel") {
    return this.show({
      title: title,
      text: text,
      type: "danger",
      icon: "fa-circle-exclamation",
      buttons: [
        { id: "confirm", text: confirmText, type: "danger" },
        { id: "cancel", text: cancelText, type: "cancel" },
      ],
    }).then((res) => res.id);
  },

  inputPrompt(title, text, placeholder = "Enter value...", inputType = "text") {
    return this.show({
      title: title,
      text: text,
      type: "info",
      icon: "fa-pen-to-square",
      showInput: true,
      placeholder: placeholder,
      inputType: inputType,
      buttons: [
        { id: "confirm", text: "Submit", type: "primary" },
        { id: "cancel", text: "Cancel", type: "cancel" },
      ],
    });
  },

  close() {
    if (this.overlay) {
      this.overlay.classList.remove("active");
      this.closeTimeout = setTimeout(() => {
        this.overlay.innerHTML = "";
        this.overlay.style.display = "none";
        this.closeTimeout = null;
      }, 300);
    }
  },
};

window.addEventListener("DOMContentLoaded", () => DriverAlert.init());
