/* ============================================================
   VEHICLES.JS — PREMIUM ADR MODULE (STABLE, CLEAN)
   ============================================================ */

const API_URL =
    "https://script.google.com/macros/s/AKfycbwbZ_KSjyTTDM2iONJC87-jgVZysubMfKChDxDs8l1RKJgjUJ6Q2_7oA_RhuDna39Ra/exec?action=getvehiclesdata";

/* ============================================================
   MAIN LOADER
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {
    loadVehiclesData();
});

/* ============================================================
   FETCH VEHICLES DATA
   ============================================================ */

async function loadVehiclesData() {
    try {
        const response = await fetch(API_URL);
        const data = await response.json();

        const trucks = Array.isArray(data.trucks) ? data.trucks : [];
        const tanktrailers = Array.isArray(data.tanktrailers) ? data.tanktrailers : [];

        updateCounters(trucks, tanktrailers);          // SEKCJA 1
        updateADRStatus(trucks, tanktrailers);         // SEKCJA 2 — lista
        updateADRExtraCounters(trucks, tanktrailers);  // SEKCJA 2 — dodatkowe kafle
        renderADRReminderCenter(trucks, tanktrailers); // SEKCJA 3 — reminder center

    } catch (err) {
        console.error("API ERROR:", err);
        showErrorState();
    }
}

/* ============================================================
   SEKCJA 1 — VEHICLES OVERVIEW (kafle)
   ============================================================ */

function updateCounters(trucks, tanktrailers) {
    setTileValue("vc-trucks", trucks.length);
    setTileValue("vc-tanktrailers", tanktrailers.length);

    const adrExpiring = countADRExpiring(trucks, tanktrailers, 90);
    const adrExpired = countADRExpired(trucks, tanktrailers);

    setTileValue("vc-adr-expiring", adrExpiring);
    setTileValue("vc-adr-expired", adrExpired);
}

function setTileValue(id, value) {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = value;
}

/* ============================================================
   SEKCJA 2 — PREMIUM ADR TERMIN LIST (prawa kolumna)
   ============================================================ */

function updateADRStatus(trucks, tanktrailers) {
    const today = normalizeDate(new Date());
    const adr21 = [];
    const adr7 = [];

    [...trucks, ...tanktrailers].forEach((item) => {
        const adr = item["ADR VALID"];
        const plates = item["PLATES"] || item["REG"] || "UNKNOWN";
        const internal = item["INTERNAL NR."] || "—";   // ⭐ DODANE
        const model = item["MODEL"] || item["TYPE"] || "—";
        if (!adr) return;

        const adrDate = parseDate(adr);
        if (!adrDate) return;

        const diff = daysBetween(today, adrDate);

        if (diff > 0 && diff <= 21) adr21.push({ plates, internal, model, adrDate, diff });
        if (diff > 0 && diff <= 7) adr7.push({ plates, internal, model, adrDate, diff });
    });

    const combined = [...adr7, ...adr21];
    const unique = combined.filter(
        (item, index, self) =>
            index === self.findIndex((t) => t.plates === item.plates)
    );

    const adr21El = document.getElementById("adr-21");
    const adr7El = document.getElementById("adr-7");
    if (adr21El) adr21El.textContent = adr21.length;
    if (adr7El) adr7El.textContent = adr7.length;

    const listContainer = document.getElementById("adr-list-container");
    if (!listContainer) return;
    listContainer.innerHTML = "";

    unique.forEach((item) => {
        const urgencyClass =
            item.diff <= 7 ? "badge-7" : item.diff <= 21 ? "badge-21" : "";
        const urgencyText = item.diff <= 7 ? "7 days" : "21 days";

        const row = document.createElement("div");
        row.className = "adr-item";
        row.innerHTML = `
            <div class="adr-line-top">
                <span class="adr-plates">${item.plates}</span>
                <span class="adr-internal">${item.internal}</span>   <!-- ⭐ DODANE -->
                <span class="adr-model">${item.model}</span>
            </div>
            <div class="adr-line-bottom">
                <span class="adr-date">
                    ${fmtDate(item.adrDate)}
                    <span class="adr-badge ${urgencyClass}"></span>
                    <span class="adr-badge-text">${urgencyText}</span>
                </span>
            </div>
        `;
        listContainer.appendChild(row);
    });
}

/* ============================================================
   ADR CALCULATIONS — stable & clean
   ============================================================ */

function countADRExpiring(trucks, tanktrailers, daysLimit) {
    const today = normalizeDate(new Date());
    let count = 0;

    [...trucks, ...tanktrailers].forEach((item) => {
        const adr = item["ADR VALID"];
        if (!adr) return;

        const adrDate = parseDate(adr);
        if (!adrDate) return;

        const diff = daysBetween(today, adrDate);
        if (diff > 0 && diff <= daysLimit) count++;
    });

    return count;
}

function countADRExpired(trucks, tanktrailers) {
    const today = normalizeDate(new Date());
    let count = 0;

    [...trucks, ...tanktrailers].forEach((item) => {
        const adr = item["ADR VALID"];
        if (!adr) return;

        const adrDate = parseDate(adr);
        if (!adrDate) return;

        const diff = daysBetween(today, adrDate);
        if (diff < 0) count++;
    });

    return count;
}

/* ============================================================
   DATE HELPERS — stable & safe
   ============================================================ */

function normalizeDate(d) {
    const x = new Date(d);
    x.setHours(0, 0, 0, 0);
    return x;
}

function daysBetween(dateA, dateB) {
    const a = normalizeDate(dateA);
    const b = normalizeDate(dateB);
    return Math.round((b - a) / 86400000);
}

function parseDate(value) {
    if (!value) return null;

    // Already a Date
    if (value instanceof Date) return value;

    // Excel numeric date
    if (typeof value === "number") {
        const ms = Math.round((value - 25569) * 86400 * 1000);
        return new Date(ms);
    }

    // Normal string date
    const parsed = new Date(value);
    if (!isNaN(parsed.getTime())) return parsed;

    return null;
}

function fmtDate(d) {
    return d.toLocaleDateString("pl-PL", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });
}
/* ============================================================
   SEKCJA 2 — DODATKOWE KAFELKI (ADR DOCUMENT MISSING + ALERTS)
   ============================================================ */

function updateADRExtraCounters(trucks, tanktrailers) {
    const allVehicles = [...trucks, ...tanktrailers];

    const adrDocMissing = allVehicles.filter((v) => {
        const key = Object.keys(v).find(
            (k) => k.replace(/\s+/g, " ").trim().toUpperCase() === "ADR DOCUMENT MISSING"
        );
        const val = key ? (v[key] || "").trim().toUpperCase() : "";
        return val === "YES";
    }).length;

    const docMissingEl = document.getElementById("adr-doc-missing");
    if (docMissingEl) docMissingEl.textContent = adrDocMissing;

    const alertsEl = document.getElementById("adr-alerts-active");
    if (alertsEl) {
        alertsEl.textContent = "ON";
        alertsEl.style.color = "#0f9d58";
    }
}

/* ============================================================
   SEKCJA 3 — ADR REMINDER CENTER (FINAL)
   ============================================================ */

function renderADRReminderCenter(trucks, tanktrailers) {
    const container = document.getElementById("adr-reminder-container");
    if (!container) return;
    container.innerHTML = "";

    const today = normalizeDate(new Date());
    const reminders = [];

    function addVehicleReminder(item, type, diff) {
        const plates = item["PLATES"] || item["REG"] || "UNKNOWN";
        const internal = item["INTERNAL NR."] || "—";
        const model = item["MODEL"] || item["TYPE"] || "—";
        const adrRaw = item["ADR VALID"];
        const adrDate = parseDate(adrRaw);

        let badgeClass = "";
        let remainingText = "";

        if (type === "EXPIRED") {
            badgeClass = "badge-expired";
            remainingText = "Expired";
        } else if (type === "7 DAYS") {
            badgeClass = "badge-7";
            remainingText = `${diff} days`;
        } else if (type === "21 DAYS") {
            badgeClass = "badge-21";
            remainingText = `${diff} days`;
        }

        reminders.push({
            type,
            badgeClass,
            plates,
            internal,
            model,
            adrDate,
            remainingText,
        });
    }

    [...trucks, ...tanktrailers].forEach((item) => {
        const adr = item["ADR VALID"];
        if (!adr) return;

        const adrDate = parseDate(adr);
        if (!adrDate) return;

        const diff = daysBetween(today, adrDate);

        if (diff < 0) {
            addVehicleReminder(item, "EXPIRED", diff);
        } else if (diff <= 7) {
            addVehicleReminder(item, "7 DAYS", diff);
        } else if (diff <= 21) {
            addVehicleReminder(item, "21 DAYS", diff);
        }
    });

    const sorted = [
        ...reminders.filter((r) => r.type === "EXPIRED"),
        ...reminders.filter((r) => r.type === "21 DAYS"),
        ...reminders.filter((r) => r.type === "7 DAYS"),
    ];

    if (sorted.length === 0) {
        container.innerHTML = `
            <div class="adr-ok-message">
                All vehicles have current ADR - OK!
            </div>
        `;
        return;
    }

    sorted.forEach((r) => {
        const item = document.createElement("div");
        item.className = "adr-reminder-item";

        item.innerHTML = `
            <div class="adr-tooltip">${r.remainingText}</div>
            <span class="adr-reminder-badge ${r.badgeClass}">
                🔔 ${r.type}
            </span>


            <div class="adr-reminder-main">
                <span class="adr-reminder-plates">${r.plates}</span>
                <span class="adr-reminder-internal">${r.internal}</span>
            </div>

            <div class="adr-reminder-model">${r.model}</div>

            <div class="adr-reminder-meta">
                <span>ADR VALID: ${fmtDate(r.adrDate)}</span><br>
                <span>Remaining: ${r.remainingText}</span>
            </div>
        `;

        container.appendChild(item);
    });
}


/* ============================================================
   ERROR STATE — clean fallback
   ============================================================ */

function showErrorState() {
    ["vc-trucks", "vc-tanktrailers", "vc-adr-expiring", "vc-adr-expired"].forEach(
        (id) => {
            const el = document.getElementById(id);
            if (el) el.textContent = "ERR";
        }
    );

    const listContainer = document.getElementById("adr-list-container");
    if (listContainer) {
        listContainer.innerHTML = "";
        const row = document.createElement("div");
        row.className = "adr-item";
        row.textContent = "API ERROR";
        listContainer.appendChild(row);
    }
}

/* ============================================================
   MODULE STABILIZATION — safe guards
   ============================================================ */

function safeGet(obj, key, fallback = "—") {
    if (!obj || typeof obj !== "object") return fallback;
    const val = obj[key];
    return val !== undefined && val !== null && val !== "" ? val : fallback;
}

function safeNumber(n, fallback = 0) {
    return typeof n === "number" && !isNaN(n) ? n : fallback;
}

/* ============================================================
   FINAL EXPORT
   ============================================================ */

const VehiclesModule = {
    loadVehiclesData,
    updateCounters,
    updateADRStatus,
    updateADRExtraCounters,
    renderADRReminderCenter,
    countADRExpiring,
    countADRExpired,
    normalizeDate,
    daysBetween,
    parseDate,
    fmtDate,
    showErrorState,
};

try {
    window.VehiclesModule = VehiclesModule;
} catch (e) { }

