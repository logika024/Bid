import { parseResumeContent } from "./parser.js";
import { buildStyledDocDefinition } from "./pdf-template.js";
import { fsStore } from "./fs-store.js";

/* pdfMake comes from the classic <script> tags (window.pdfMake). */
const pdfMake = window.pdfMake;

const $ = (id) => document.getElementById(id);

const SETTINGS_KEY = "resume-pdf-web.settings";
const TEXT_FIELDS = ["name", "email", "phone", "address", "linkedin", "github", "website", "cvFileName"];
const FOLDER_KEYS = ["folderAll", "folderCv"];

let settings = {};
let handles = { folderAll: null, folderCv: null };
let currentBlob = null;
let currentUrl = null;
let renderTimer = null;

/* ===================== Settings (localStorage) ===================== */
function loadSettings() {
  try {
    settings = JSON.parse(localStorage.getItem(SETTINGS_KEY)) || {};
  } catch {
    settings = {};
  }
  $("s_name").value = settings.name || "";
  $("s_email").value = settings.email || "";
  $("s_phone").value = settings.phone || "";
  $("s_address").value = settings.address || "";
  $("s_linkedin").value = settings.linkedin || "";
  $("s_github").value = settings.github || "";
  $("s_website").value = settings.website || "";
  $("s_cvFileName").value = settings.cvFileName || "";
}

function readSettingsForm() {
  const out = {};
  for (const k of TEXT_FIELDS) out[k] = $("s_" + k).value.trim();
  return out;
}

function saveSettings() {
  settings = readSettingsForm();
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  const status = $("settingsStatus");
  if (!settings.name) {
    status.textContent = "Name is required.";
    status.className = "status err";
    return;
  }
  status.textContent = "Saved.";
  status.className = "status ok";
  setTimeout(() => (status.textContent = ""), 2200);
  scheduleRender();
}

function contactFromSettings() {
  return {
    email: settings.email,
    phone: settings.phone,
    address: settings.address,
    linkedin: settings.linkedin,
    github: settings.github,
    website: settings.website,
  };
}

/* ===================== Folder handles ===================== */
async function refreshFolderUI() {
  for (const key of FOLDER_KEYS) {
    const handle = handles[key];
    const card = $(key === "folderAll" ? "folderCardAll" : "folderCardCv");
    const stateEl = card.querySelector(".folder-state");
    const pill = $(key === "folderAll" ? "pillAll" : "pillCv");

    if (!handle) {
      stateEl.textContent = "Not connected";
      stateEl.className = "folder-state";
      card.classList.remove("connected");
      pill.className = "pill";
      continue;
    }
    const perm = await fsStore.permissionState(handle);
    card.classList.add("connected");
    if (perm === "granted") {
      stateEl.textContent = "✓ " + handle.name;
      stateEl.className = "folder-state ok";
      pill.className = "pill connected";
    } else {
      stateEl.textContent = "⟳ " + handle.name + " (click to allow)";
      stateEl.className = "folder-state warn";
      pill.className = "pill needs-permission";
    }
  }
}

async function loadHandles() {
  for (const key of FOLDER_KEYS) {
    handles[key] = (await fsStore.getFolder(key)) || null;
  }
  await refreshFolderUI();
}

async function connectFolder(key) {
  try {
    handles[key] = await fsStore.pickFolder(key);
    await refreshFolderUI();
  } catch (e) {
    /* user cancelled the picker */
  }
}

async function forgetFolder(key) {
  await fsStore.forgetFolder(key);
  handles[key] = null;
  await refreshFolderUI();
}

/* ===================== Filenames ===================== */
function sanitizeKeepSpaces(s) {
  return String(s || "").replace(/[\\/:*?"<>|]/g, "").replace(/\s+/g, " ").trim();
}
/* Turn the user-typed CV file name into a safe filename ending in .pdf.
   Returns "" if nothing usable remains after sanitizing. */
function cvFileNameFrom(input) {
  let base = sanitizeKeepSpaces(input).replace(/\.pdf$/i, "").trim();
  if (!base) return "";
  return base + ".pdf";
}
function timestamp() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, "0");
  return (
    `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}` +
    `_${p(d.getHours())}-${p(d.getMinutes())}-${p(d.getSeconds())}`
  );
}

/* ===================== PDF build ===================== */
function buildDoc() {
  const content = $("content").value;
  const resume = parseResumeContent(content, settings.name || "", contactFromSettings());
  return { resume, docDef: buildStyledDocDefinition(resume) };
}

function makeBlob(docDef) {
  return new Promise((resolve, reject) => {
    try {
      pdfMake.createPdf(docDef).getBlob((blob) => resolve(blob));
    } catch (e) {
      reject(e);
    }
  });
}

/* ===================== Live preview ===================== */
function scheduleRender() {
  clearTimeout(renderTimer);
  renderTimer = setTimeout(renderPreview, 350);
}

async function renderPreview() {
  const content = $("content").value.trim();
  const empty = $("previewEmpty");
  const frame = $("preview");
  if (!content || !(settings.name || "").trim()) {
    frame.classList.remove("show");
    empty.style.display = "grid";
    $("downloadBtn").disabled = true;
    return;
  }
  try {
    const { docDef } = buildDoc();
    const blob = await makeBlob(docDef);
    currentBlob = blob;
    if (currentUrl) URL.revokeObjectURL(currentUrl);
    currentUrl = URL.createObjectURL(blob);
    frame.src = currentUrl + "#toolbar=1&view=FitH";
    frame.classList.add("show");
    empty.style.display = "none";
    $("downloadBtn").disabled = false;
  } catch (e) {
    setStatus("Preview failed: " + e.message, "err");
  }
}

/* ===================== Helpers ===================== */
function setStatus(msg, kind) {
  const s = $("status");
  s.textContent = msg;
  s.className = "status" + (kind ? " " + kind : "");
}

function downloadBlob(blob, name) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

/* ===================== Generate & Save ===================== */
async function generateAndSave() {
  const jobTitle = $("jobTitle").value.trim();
  const companyName = $("companyName").value.trim();
  const content = $("content").value;
  const cvName = cvFileNameFrom(settings.cvFileName);

  if (!(settings.name || "").trim()) return setStatus("Set your Name in Settings first.", "err");
  if (!content.trim()) return setStatus("Resume content is empty.", "err");
  if (!jobTitle) return setStatus("Job Title is required.", "err");
  if (!companyName) return setStatus("Company Name is required.", "err");
  if (!cvName) return setStatus("Set a CV file name in Settings first.", "err");

  setStatus("Generating…");
  const btn = $("generateBtn");
  btn.disabled = true;

  let blob;
  try {
    const { docDef } = buildDoc();
    blob = await makeBlob(docDef);
    currentBlob = blob;
  } catch (e) {
    btn.disabled = false;
    return setStatus("PDF generation failed: " + e.message, "err");
  }

  const allName = `${sanitizeKeepSpaces(companyName)} - ${sanitizeKeepSpaces(jobTitle)} - ${timestamp()}.pdf`;

  const canUseFs = fsStore.supported() && handles.folderAll && handles.folderCv;

  try {
    if (canUseFs) {
      const okAll = await fsStore.ensureWritable(handles.folderAll);
      const okCv = await fsStore.ensureWritable(handles.folderCv);
      if (!okAll || !okCv) throw new Error("permission denied");
      await fsStore.writeFile(handles.folderAll, allName, blob);
      await fsStore.writeFile(handles.folderCv, cvName, blob);
      await refreshFolderUI();
      setStatus(`✓ Saved to both folders — ${allName}`, "ok");
    } else {
      // Fallback: download the two named files.
      downloadBlob(blob, allName);
      downloadBlob(blob, cvName);
      const reason = fsStore.supported()
        ? "Connect both folders in Settings to auto-save."
        : "This browser can't write to folders (use Chrome/Edge).";
      setStatus(`Downloaded ${allName} & ${cvName}. ${reason}`, "ok");
    }
  } catch (e) {
    // If folder write failed, still give the user the files.
    downloadBlob(blob, allName);
    downloadBlob(blob, cvName);
    setStatus("Folder save failed (" + e.message + ") — downloaded instead.", "err");
  } finally {
    btn.disabled = false;
  }
}

/* ===================== Drawer ===================== */
function openDrawer() {
  $("drawer").classList.add("open");
  $("drawerBackdrop").classList.add("open");
}
function closeDrawer() {
  $("drawer").classList.remove("open");
  $("drawerBackdrop").classList.remove("open");
}

/* ===================== Wire up ===================== */
function init() {
  loadSettings();
  loadHandles();

  if (!fsStore.supported()) $("fsUnsupported").style.display = "block";

  $("openSettings").addEventListener("click", openDrawer);
  $("closeSettings").addEventListener("click", closeDrawer);
  $("drawerBackdrop").addEventListener("click", closeDrawer);
  $("saveSettings").addEventListener("click", saveSettings);

  document.querySelectorAll("[data-connect]").forEach((b) =>
    b.addEventListener("click", () => connectFolder(b.dataset.connect))
  );
  document.querySelectorAll("[data-forget]").forEach((b) =>
    b.addEventListener("click", () => forgetFolder(b.dataset.forget))
  );

  $("generateBtn").addEventListener("click", generateAndSave);
  $("refreshPreview").addEventListener("click", renderPreview);
  $("content").addEventListener("input", scheduleRender);

  $("downloadBtn").addEventListener("click", () => {
    if (!currentBlob) return;
    const name = cvFileNameFrom(settings.cvFileName) || "Resume.pdf";
    downloadBlob(currentBlob, name);
  });
}

init();
