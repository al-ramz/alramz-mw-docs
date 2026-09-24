(function () {
  var SALT = "alramz-mw-docs-v1";
  var SESSION_TTL_MS = 12 * 60 * 60 * 1000; // 12 hours

  function sha256Hex(message) {
    var data = new TextEncoder().encode(message);
    return crypto.subtle.digest("SHA-256", data).then(function (buf) {
      return Array.prototype.map
        .call(new Uint8Array(buf), function (b) {
          return ("00" + b.toString(16)).slice(-2);
        })
        .join("");
    });
  }

  function unlock() {
    document.documentElement.removeAttribute("data-auth-locked");
  }

  function startSession() {
    try {
      localStorage.setItem("mwdocs_auth_exp", String(Date.now() + SESSION_TTL_MS));
    } catch (e) {
      // storage unavailable (e.g. private browsing) - session just won't persist across pages
    }
  }

  function clearSession() {
    try {
      localStorage.removeItem("mwdocs_auth_exp");
    } catch (e) {}
  }

  function initGate() {
    var gate = document.getElementById("mwdocs-auth-gate");
    if (!gate) return;

    var form = document.getElementById("mwdocs-auth-form");
    var userInput = document.getElementById("mwdocs-auth-user");
    var passInput = document.getElementById("mwdocs-auth-pass");
    var errorEl = document.getElementById("mwdocs-auth-error");

    form.addEventListener("submit", function (evt) {
      evt.preventDefault();

      var cfg = window.__MWDOCS_AUTH__;
      if (!cfg || !cfg.u || !cfg.p) {
        errorEl.textContent = "Authentication is not configured for this deployment.";
        errorEl.hidden = false;
        return;
      }

      Promise.all([sha256Hex(SALT + userInput.value), sha256Hex(SALT + passInput.value)]).then(
        function (hashes) {
          if (hashes[0] === cfg.u && hashes[1] === cfg.p) {
            startSession();
            unlock();
            errorEl.hidden = true;
          } else {
            errorEl.textContent = "Invalid username or password.";
            errorEl.hidden = false;
            passInput.value = "";
            passInput.focus();
          }
        }
      );
    });

    document.querySelectorAll("[data-mwdocs-logout]").forEach(function (el) {
      el.addEventListener("click", function (evt) {
        evt.preventDefault();
        clearSession();
        location.reload();
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initGate);
  } else {
    initGate();
  }
})();
