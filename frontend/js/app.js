/**
 * app.js — Dept E
 * Flow:
 *   Step 1: Enter URL → validate → go to Step 2
 *   Step 2: Pick which reports you want → click "Generate prompt"
 *           → POST /business with { website, reports } → get prompt back
 *   Step 3: Copy prompt → run in Grok → come back → click "I've run Grok"
 *   Step 4: POST /business-search → display results
 */

let selectedReports = new Set();
let fetchedData     = {};
let grokPromptText  = "";
let websiteUrl      = "";

/* ── Screen nav ── */
function showScreen(id) {
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  document.getElementById(id).classList.add("active");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

/* ══════════════════════════════════════════════════
   STEP 1 — Validate URL, move to report selection
   ══════════════════════════════════════════════════ */
function startAnalysis() {
  const input = document.getElementById("website-url");
  const errEl = document.getElementById("input-error");

  let url = input.value.trim();
  if (!url) { showErr(errEl, "Please enter a website URL."); return; }
  if (!/^https?:\/\/.+\..+/.test(url)) { showErr(errEl, "Please enter a valid URL (include https://)"); return; }
  errEl.classList.add("hidden");

  websiteUrl = url;
  buildReportGrid();
  showScreen("step-select");
}

function showErr(el, msg) {
  el.textContent = msg;
  el.classList.remove("hidden");
}

/* ══════════════════════════════════════════════════
   STEP 2 — Pick reports, then call n8n for prompt
   ══════════════════════════════════════════════════ */
function buildReportGrid() {
  const grid = document.getElementById("report-grid");
  grid.innerHTML = "";
  selectedReports.clear();

  REPORTS.forEach(r => {
    const chip = document.createElement("div");
    chip.className   = "report-chip";
    chip.dataset.key = r.key;
    chip.innerHTML   = `<span class="chip-icon">${r.icon}</span><span class="chip-label">${r.label}</span>`;
    chip.addEventListener("click", () => toggleReport(r.key, chip));
    grid.appendChild(chip);
  });
}

function toggleReport(key, el) {
  if (selectedReports.has(key)) { selectedReports.delete(key); el.classList.remove("selected"); }
  else                          { selectedReports.add(key);    el.classList.add("selected"); }
}
function selectAll()  { document.querySelectorAll(".report-chip").forEach(c => { c.classList.add("selected");    selectedReports.add(c.dataset.key); }); }
function selectNone() { document.querySelectorAll(".report-chip").forEach(c => { c.classList.remove("selected"); }); selectedReports.clear(); }

function generatePrompt() {
  if (selectedReports.size === 0) { alert("Please select at least one report first."); return; }

  const loadEl = document.getElementById("step2-loading");
  const loadTxt = document.getElementById("step2-loading-text");
  const btn    = document.getElementById("btn-generate");

  btn.disabled = true;
  loadEl.classList.remove("hidden");
  loadTxt.textContent = "Scraping website & building your prompt…";

  fetch(CONFIG.WEBHOOK_ANALYSE, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({ website: websiteUrl, reports: Array.from(selectedReports) }),
    signal:  AbortSignal.timeout(CONFIG.ANALYSE_TIMEOUT),
  })
  .then(res => { if (!res.ok) throw new Error(`Server error ${res.status}`); return res.json(); })
  .then(payload => {
    loadEl.classList.add("hidden");
    btn.disabled = false;

    const raw = Array.isArray(payload) ? payload[0] : payload;

console.log("Webhook Response:", raw);

grokPromptText = raw.prompt || raw.content || "No prompt returned.";

document.getElementById("grok-prompt-text").textContent = grokPromptText;

    document.getElementById("grok-prompt-text").textContent = grokPromptText;

    const labels = Array.from(selectedReports)
      .map(k => REPORTS.find(r => r.key === k)?.label)
      .filter(Boolean);
    document.getElementById("prompt-reports-list").textContent = labels.join(", ");

    showScreen("step-prompt");
})
  .catch(err => {
    loadEl.classList.add("hidden");
    btn.disabled = false;
    alert(`Could not generate prompt: ${err.message}`);
  });
}

/* ══════════════════════════════════════════════════
   STEP 3 — Show prompt, user runs Grok
   ══════════════════════════════════════════════════ */
function copyPrompt() {
  const btn = document.querySelector(".btn-copy-prompt");
  navigator.clipboard.writeText(grokPromptText).then(() => {
    btn.textContent = "✓ Copied!";
    setTimeout(() => { btn.textContent = "Copy prompt"; }, 2000);
  }).catch(() => {
    const el = document.getElementById("grok-prompt-text");
    const range = document.createRange();
    range.selectNodeContents(el);
    window.getSelection().removeAllRanges();
    window.getSelection().addRange(range);
  });
}

function grokDone() {
  showScreen("step-fetch");
}

/* ══════════════════════════════════════════════════
   STEP 4 — Fetch from Drive & show results
   ══════════════════════════════════════════════════ */
function fetchReports() {
  const loadEl  = document.getElementById("step4-loading");
  const loadTxt = document.getElementById("step4-loading-text");
  const btn     = document.getElementById("btn-fetch");

  btn.disabled = true;
  loadEl.classList.remove("hidden");
  loadTxt.textContent = `Fetching ${selectedReports.size} report${selectedReports.size > 1 ? "s" : ""} from Drive…`;

  fetch(CONFIG.WEBHOOK_FETCH, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({ reports: Array.from(selectedReports) }),
    signal:  AbortSignal.timeout(CONFIG.FETCH_TIMEOUT),
  })
  .then(res => { if (!res.ok) throw new Error(`Server error ${res.status}`); return res.json(); })
  .then(payload => {
    console.log("[DeptE] raw payload:", JSON.stringify(payload, null, 2));

    const raw  = Array.isArray(payload) ? payload[0] : payload;
    const KEYS = ["business","audience","keyword","competitor","backlink","seo","ad"];

    const candidates = [raw];
    if (raw?.data) {
      let d = raw.data;
      if (typeof d === "string") { try { d = JSON.parse(d); } catch(e) {} }
      candidates.push(d);
    }
    Object.values(raw || {}).forEach(v => {
      if (v && typeof v === "object" && !Array.isArray(v)) candidates.push(v);
    });

    let best = {}, bestCount = 0;
    for (const c of candidates) {
      if (!c || typeof c !== "object") continue;
      const hits = KEYS.filter(k => c[k] && String(c[k]).trim().length > 0);
      if (hits.length > bestCount) { bestCount = hits.length; best = c; }
    }

    console.log("[DeptE] keys found:", KEYS.filter(k => best[k]));

    fetchedData = {};
    for (const key of selectedReports) {
      if (best[key] && String(best[key]).trim() !== "") fetchedData[key] = best[key];
    }

    loadEl.classList.add("hidden");
    btn.disabled = false;
    buildResults();
    showScreen("step-results");
  })
  .catch(err => {
    loadEl.classList.add("hidden");
    btn.disabled = false;
    alert(`Could not fetch reports: ${err.message}`);
  });
}

/* ══════════════════════════════════════════════════
   STEP 5 — Render results
   ══════════════════════════════════════════════════ */
function buildResults() {
  const nav     = document.getElementById("results-nav");
  const content = document.getElementById("results-content");
  nav.innerHTML = content.innerHTML = "";

  const active = REPORTS.filter(r => selectedReports.has(r.key) && fetchedData[r.key]);

  if (active.length === 0) {
    const returned = Object.keys(fetchedData).join(", ") || "none";
    const selected = Array.from(selectedReports).join(", ");
    content.innerHTML = `
      <div style="padding:40px 0;color:var(--ink-light)">
        <p style="font-family:var(--font-display);font-style:italic;font-size:1.1rem;margin-bottom:16px">No matching data was returned.</p>
        <p style="font-size:0.82rem;line-height:1.8">
          <strong>You selected:</strong> ${selected}<br>
          <strong>Keys in response:</strong> ${returned}<br><br>
          Make sure Grok has finished and saved files to Google Drive, then try again.
        </p>
        <div style="display:flex;gap:10px;margin-top:20px;flex-wrap:wrap">
          <button class="btn-ghost" onclick="showScreen('step-fetch')">← Try fetching again</button>
        </div>
      </div>`;
    return;
  }

  active.forEach((r, idx) => {
    const tab = document.createElement("button");
    tab.className   = "nav-tab" + (idx === 0 ? " active" : "");
    tab.dataset.key = r.key;
    tab.innerHTML   = `<span class="tab-icon">${r.icon}</span>${r.label}`;
    tab.addEventListener("click", () => switchTab(r.key));
    nav.appendChild(tab);

    const panel     = document.createElement("div");
    panel.className = "report-panel";
    panel.id        = `panel-${r.key}`;
    panel.style.display = idx === 0 ? "block" : "none";
    panel.innerHTML = `
      <div class="report-panel-header">
        <span class="report-panel-icon">${r.icon}</span>
        <span class="report-panel-title">${r.label}</span>
        <span class="report-panel-sub">${r.desc}</span>
      </div>
      <div class="report-panel-body">
        <div class="report-text">${formatText(fetchedData[r.key])}</div>
        <button class="btn-ghost copy-btn" onclick="copyReport('${r.key}')">✦ Copy to clipboard</button>
      </div>`;
    content.appendChild(panel);
  });
}

function switchTab(key) {
  document.querySelectorAll(".nav-tab").forEach(t => t.classList.toggle("active", t.dataset.key === key));
  REPORTS.forEach(r => {
    const p = document.getElementById(`panel-${r.key}`);
    if (p) p.style.display = r.key === key ? "block" : "none";
  });
  document.getElementById(`panel-${key}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function copyReport(key) {
  navigator.clipboard.writeText(fetchedData[key] || "").then(() => {
    const btn = document.querySelector(`#panel-${key} .copy-btn`);
    if (btn) { btn.textContent = "✓ Copied!"; setTimeout(() => { btn.innerHTML = "✦ Copy to clipboard"; }, 1800); }
  });
}

function formatText(raw) {
  if (!raw) return "<em>No content returned.</em>";
  const esc = raw.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
  return esc
    .replace(/^#{1,3}\s+(.+)$/gm, (_, h) => `<strong>${h}</strong>`)
    .replace(/^([A-Z][A-Z0-9 &\/\-]{3,}:?)\s*$/gm, (_, h) => `<strong>${h}</strong>`);
}

function goBack() {
  fetchedData = {}; selectedReports.clear(); grokPromptText = ""; websiteUrl = "";
  document.getElementById("website-url").value = "";
  document.getElementById("input-error").classList.add("hidden");
  showScreen("step-input");
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("website-url")?.addEventListener("keydown", e => {
    if (e.key === "Enter") startAnalysis();
  });
});