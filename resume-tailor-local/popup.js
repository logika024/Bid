/* Popup: paste a job description, generate a resume, auto-save it to the folder. */

const $ = (id) => document.getElementById(id);
let settings = {};
let lastResult = null; // { company, position, fileName, resume }

function setStatus(msg, kind) {
  const el = $("status");
  el.className = "status" + (kind ? " " + kind : "");
  el.innerHTML =
    kind === "busy" ? '<span class="spinner"></span>' + msg : msg || "";
}

function pdfBlob(docDefinition) {
  return new Promise((resolve, reject) => {
    try {
      pdfMake.createPdf(docDefinition).getBlob((blob) => resolve(blob));
    } catch (e) {
      reject(e);
    }
  });
}

/* Assemble the final resume object: the model writes content, profile owns the facts. */
function assembleResume(profile, gen) {
  return {
    name: profile.name,
    headline: gen.headline || gen.position || "",
    contact: {
      email: profile.email,
      phone: profile.phone,
      location: profile.location,
      linkedin: profile.linkedin,
      website: profile.website,
    },
    summary: gen.summary || "",
    skills: Array.isArray(gen.skills) ? gen.skills : [],
    experience: (profile.experience || []).map((r, i) => ({
      company: r.company,
      title: r.title,
      location: r.location,
      start: r.start,
      end: r.end,
      bullets:
        (Array.isArray(gen.experienceBullets) && gen.experienceBullets[i]) || [],
    })),
    education: (profile.education || []).map((e) => ({
      school: e.school,
      degree: e.degree,
      location: e.location,
      start: e.start,
      end: e.end,
      details: "",
    })),
    sectionOrder: RT.SECTION_ORDER,
  };
}

function showResult(result, saveNote, saveOk) {
  lastResult = result;
  $("rCompany").textContent = result.company || "—";
  $("rPosition").textContent = result.position || "—";
  $("rFile").textContent = result.fileName;
  const note = $("saveNote");
  note.textContent = saveNote || "";
  note.style.color = saveOk ? "var(--good)" : "var(--bad)";
  $("resultCard").classList.remove("hidden");
}

async function init() {
  const K = RT.KEYS;
  settings = await RT.storage.get([
    K.baseURL, K.apiKey, K.model, K.genPrompt, K.profile, K.folderName, K.lastResult,
  ]);
  const folderHandle = await RT.fs.getFolder();

  const missing = [];
  if (!settings[K.baseURL]) missing.push("the local server URL");
  if (!settings[K.model]) missing.push("a model name");
  if (!RT.profileIsComplete(settings[K.profile])) missing.push("your profile");
  if (!folderHandle) missing.push("a save folder");

  if (missing.length) {
    $("setupMsg").textContent =
      "Finish setup first — add " + missing.join(", ") + " in Settings.";
    $("setupView").classList.remove("hidden");
    return;
  }

  $("mainView").classList.remove("hidden");
  if (settings[K.lastResult]) {
    showResult(settings[K.lastResult], "Previously generated.", true);
  }
}

async function generate() {
  const jd = $("jd").value.trim();
  if (jd.length < 40) {
    setStatus("Please paste a fuller job description first.", "err");
    return;
  }

  $("generateBtn").disabled = true;
  const K = RT.KEYS;

  // Secure write access NOW, while we still have a user gesture — the model
  // call below outlasts the transient activation window.
  const folderHandle = await RT.fs.getFolder();
  let canWrite = false;
  try {
    canWrite = await RT.fs.ensureWritable(folderHandle);
  } catch (_) {
    canWrite = false;
  }
  if (!canWrite) {
    setStatus(
      "Folder write access was not granted — the PDF will still be downloadable below.",
      "err"
    );
  }

  setStatus(
    "Generating with " + (settings[K.model] || RT.DEFAULT_MODEL) +
      " — this can take 30-90 s on a local model…",
    "busy"
  );
  try {
    const gen = await RT.llm.generateResume({
      baseURL: settings[K.baseURL] || RT.DEFAULT_BASE_URL,
      apiKey: settings[K.apiKey],
      model: settings[K.model] || RT.DEFAULT_MODEL,
      profile: settings[K.profile],
      jobDescription: jd,
      genPrompt: settings[K.genPrompt] || RT.DEFAULT_PROMPT,
    });

    const company = gen.company || "Company";
    const position = gen.position || "Position";
    const resume = assembleResume(settings[K.profile], gen);
    const fileName = RT.buildFileName(company, position);
    const result = { company, position, fileName, resume };

    await RT.storage.set({ [K.lastResult]: result });

    // Save into the chosen folder.
    let saveNote, saveOk;
    if (canWrite) {
      try {
        const blob = await pdfBlob(RT.buildDocDefinition(resume));
        await RT.fs.writeFile(folderHandle, fileName, blob);
        saveNote = "Saved to your folder: " + fileName;
        saveOk = true;
      } catch (e) {
        saveNote = "Could not write to folder: " + (e.message || e);
        saveOk = false;
      }
    } else {
      saveNote = "Not saved to folder (no access). Use the download button below.";
      saveOk = false;
    }

    showResult(result, saveNote, saveOk);
    setStatus(saveOk ? "Done." : "Generated, but not saved to the folder.", saveOk ? "ok" : "err");
  } catch (e) {
    setStatus(e.message || String(e), "err");
  } finally {
    $("generateBtn").disabled = false;
  }
}

function downloadCopy() {
  if (!lastResult) return;
  try {
    const doc = RT.buildDocDefinition(lastResult.resume);
    pdfMake.createPdf(doc).download(lastResult.fileName);
  } catch (e) {
    setStatus("Could not build the PDF: " + (e.message || e), "err");
  }
}

$("generateBtn").addEventListener("click", generate);
$("downloadBtn").addEventListener("click", downloadCopy);
$("settingsBtn").addEventListener("click", () => chrome.runtime.openOptionsPage());
$("openSettings").addEventListener("click", () => chrome.runtime.openOptionsPage());

init();
