/* =========================================================
   KP GASLOGISTIK
   Enterprise Security Gate Premium V3
========================================================= */

let KP_SESSION_HOURS = 0.5;

async function loadSettings(){
  try{
    const r = await fetch(GAS_URL + "?action=getSettings");
    const s = await r.json();
    if(s.SESSION_HOURS){
      KP_SESSION_HOURS = Number(s.SESSION_HOURS);
    }
  }catch(e){
    console.error("SETTINGS",e);
  }
}

const KP_PROTECTED_PAGES = [
  "operator.html",
  "login.html",
  "cloud.html",
  "alerts.html"
];

(function () {

let targetHref = null;

/* =========================
   SESSION
========================= */

function logoutKP() {
  localStorage.removeItem("kp_logged");
  localStorage.removeItem("kp_user");
  localStorage.removeItem("kp_login_time");
}

function sessionValid() {

  const logged = localStorage.getItem("kp_logged");

  const loginTime = parseInt(
    localStorage.getItem("kp_login_time") || "0",
    10
  );

  if (!logged || !loginTime) return false;

  const maxAge = KP_SESSION_HOURS * 60 * 60 * 1000;

  if (Date.now() - loginTime > maxAge) {
    logoutKP();
    return false;
  }

  return true;
}

/* =========================
   AUTO LOGOUT
========================= */

function startAutoLogout() {

  if (!sessionValid()) return;

  const loginTime =
    Number(
      localStorage.getItem("kp_login_time")
    );

  const expires =
    loginTime +
    (KP_SESSION_HOURS * 60 * 60 * 1000);

  const timeout =
    expires - Date.now();

  if (timeout <= 0) {

    logoutKP();

    alert(
      "Session expired. Please login again."
    );

    location.reload();

    return;
  }

  setTimeout(() => {

    logoutKP();

    alert(
      "Session expired. Please login again."
    );

    location.reload();

  }, timeout);

}

/* =========================
   PROTECTED PAGE CHECK
========================= */

function protectCurrentPage() {

  const page =
    window.location.pathname.split("/").pop().toLowerCase();

  if (
    KP_PROTECTED_PAGES.includes(page) &&
    !sessionValid()
  ) {

    ensureModal();

    targetHref = window.location.href;

    document
      .getElementById("authOverlay")
      .classList.add("show");
  }
}

/* =========================
   LOGIN MODAL
========================= */

function ensureModal() {

  if (document.getElementById("authOverlay")) return;

  document.body.insertAdjacentHTML(
    "beforeend",
    `
<div class="auth-overlay" id="authOverlay">

 <div class="auth-modal">

   <div class="auth-logo">

     <svg viewBox="0 0 600 120">
       <text
         x="50%"
         y="50%"
         dominant-baseline="middle"
         text-anchor="middle">
         KP GASLOGISTIK
       </text>
     </svg>

   </div>

   <div class="auth-title">
      ENTERPRISE SECURITY GATE
   </div>

   <div class="auth-sub">
      Premium Command Center Access
   </div>

   <label>LOGIN</label>
   <input id="authUser" autocomplete="username">

   <label>PASSWORD</label>
   <input
      id="authPass"
      type="password"
      autocomplete="current-password">

   <div class="auth-actions">

      <button id="authOk">
         LOGIN
      </button>

      <button id="authCancel">
         CANCEL
      </button>

   </div>

   <div class="auth-msg" id="authMsg"></div>

 </div>

</div>
`
  );

  document.getElementById("authOk")
    .addEventListener("click", submitAuth);

  document.getElementById("authCancel")
    .addEventListener("click", closeAuth);

  document.getElementById("authPass")
    .addEventListener("keydown", e => {

      if (e.key === "Enter") {
        submitAuth();
      }

    });
}

/* =========================
   OPEN / CLOSE
========================= */

window.openAuth = function (href) {

  ensureModal();

  targetHref = href;

  document.getElementById("authMsg").textContent = "";

  document
    .getElementById("authOverlay")
    .classList.add("show");
};

window.closeAuth = function () {

  const overlay =
    document.getElementById("authOverlay");

  if (overlay) {
    overlay.classList.remove("show");
  }
};

/* =========================
   LOGIN
========================= */

window.submitAuth = submitAuth;

async function submitAuth() {

  const user =
    document
      .getElementById("authUser")
      .value
      .trim()
      .toLowerCase();

  const pass =
    document
      .getElementById("authPass")
      .value;

  const currentPage=(targetHref||location.pathname.split("/").pop()||"index.html");

  try {

    const response = await fetch(
      GAS_URL +
      "?action=login&user=" +
      encodeURIComponent(user) +
      "&pass=" +
      encodeURIComponent(pass)
    );

    const account = await response.json();

    if (account.success) {

      localStorage.setItem("kp_logged", "1");
      localStorage.setItem("kp_user", account.user.toUpperCase());
      localStorage.setItem(
        "kp_login_time",
        Date.now().toString()
      );

      await sendLoginHistory(user,currentPage,"SUCCESS");

      if (targetHref) {
        window.location.href = targetHref;
      } else {
        location.reload();
      }

    } else {

      await sendLoginHistory(user,currentPage,"FAILED");

      document.getElementById("authMsg").textContent =
        "Invalid login or password";

    }

  } catch(err) {

    document.getElementById("authMsg").textContent =
      "Connection error";

  }
}

/* =========================
   OPERATOR MENU
========================= */

function initOperatorMenu() {

  if (!sessionValid()) return;

  const operator =
    document.querySelector(".operator-link");

  if (!operator) return;

  const user =
    localStorage.getItem("kp_user");

  operator.textContent =
    `(${user})`;

  const menu = document.createElement("div");

  menu.className = "kp-user-menu";

  menu.innerHTML = `
     <div class="kp-user-name">${user}</div>
     <div class="kp-user-time" id="kpUserTime"></div>
     <div class="kp-user-logout">LOGOUT</div>
  `;

  document.body.appendChild(menu);

  operator.addEventListener("click", e => {

    e.preventDefault();

    const rect =
      operator.getBoundingClientRect();

    menu.style.left =
      rect.left + "px";

    menu.style.top =
      rect.bottom + 10 + "px";

    menu.classList.toggle("show");
  });

  document.addEventListener("click", e => {

    if (
      !menu.contains(e.target) &&
      e.target !== operator
    ) {
      menu.classList.remove("show");
    }

  });

  menu
    .querySelector(".kp-user-logout")
    .addEventListener("click", () => {

      logoutKP();

      location.reload();
    });
	
  function updateMenuTime() {

  const el = document.getElementById("kpUserTime");
  if (!el) return;

  const loginTime =
    Number(localStorage.getItem("kp_login_time"));

  if (!loginTime) return;

  const expires =
    loginTime +
    (KP_SESSION_HOURS * 60 * 60 * 1000);

  const remaining =
    expires - Date.now();

  if (remaining <= 0) {
    el.textContent = "Session expired";
    return;
  }

  const h =
    Math.floor(remaining / 1000 / 60 / 60);

  const m =
    Math.floor((remaining / 1000 / 60) % 60);

  el.textContent =
    `Remaining: ${h}h ${m}m`;
}

updateMenuTime();
setInterval(updateMenuTime, 60000);
}

/* =========================
   ICON PROTECTION
========================= */

function protectIcons() {

  document
    .querySelectorAll(".topicon")
    .forEach(el => {

      if (
        el.classList.contains("operator-link")
        &&
        sessionValid()
      ) {
        return;
      }

      el.addEventListener("click", e => {

        const href =
          el.getAttribute("href");

        if (!href) return;

        e.preventDefault();

        if (sessionValid()) {

          window.location.href = href;

          return;
        }

        openAuth(href);

      });

    });

}

/* =========================
   SESSION COUNTDOWN
========================= */

function startSessionCountdown() {

  if (!sessionValid()) return;

  const operator =
    document.querySelector(".operator-link");

  if (!operator) return;

  const originalText = operator.textContent;

  function updateCountdown() {

    const loginTime =
      Number(localStorage.getItem("kp_login_time"));

    if (!loginTime) return;

    const expires =
      loginTime +
      (KP_SESSION_HOURS * 60 * 60 * 1000);

    const remaining =
      expires - Date.now();

    if (remaining <= 0) return;

    const h =
      Math.floor(remaining / 1000 / 60 / 60);

    const m =
      Math.floor((remaining / 1000 / 60) % 60);

    operator.textContent =
      `${originalText}`;
  }

  updateCountdown();

  setInterval(updateCountdown, 60000);
}

/* =========================
   AUTO LOGOUT
========================= */

function startAutoLogout() {

  if (!sessionValid()) return;

  const loginTime =
    Number(localStorage.getItem("kp_login_time"));

  const expires =
    loginTime +
    (KP_SESSION_HOURS * 60 * 60 * 1000);

  const timeout =
    expires - Date.now();

  if (timeout <= 0) {

    logoutKP();

    alert(
      "Session expired. Please login again."
    );

    location.reload();

    return;
  }

  setTimeout(() => {

    logoutKP();

    alert(
      "Session expired. Please login again."
    );

    location.reload();

  }, timeout);
}

/* =========================
   START
========================= */

document.addEventListener(
  "DOMContentLoaded",
  async () => {

    await loadSettings();

    ensureModal();

    protectCurrentPage();

    initOperatorMenu();

    protectIcons();

    startSessionCountdown();

    startAutoLogout();

  }
);

})();
const GAS_URL="https://script.google.com/macros/s/AKfycbz9eVUGDpTGPx5-7sr3YQY-ZV71Y74FGk5qwDb_uhmyn0Q9xkEf3zig_mDVJ-xYv1iK/exec";

async function sendLoginHistory(user,page,result){
  try{
    await fetch(GAS_URL,{
      method:"POST",
      body:JSON.stringify({user:user,page:page,result:result})
    });
  }catch(e){
    console.error("LOGIN_HISTORY",e);
  }
}