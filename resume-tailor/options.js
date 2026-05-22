/* Settings page: OpenAI, save folder, profile form, generation prompt. */

const $ = (id) => document.getElementById(id);

function status(el, msg, kind) {
  el.className = "status" + (kind ? " " + kind : "");
  el.textContent = msg || "";
}

/* ---- Repeatable entry rows ---- */
function addEntry(listId, tplId, data) {
  const tpl = $(tplId);
  const node = tpl.content.firstElementChild.cloneNode(true);
  data = data || {};
  node.querySelectorAll("[data-f]").forEach((inp) => {
    inp.value = data[inp.dataset.f] || "";
  });
  node.querySelector(".entry-del").addEventListener("click", () => node.remove());
  $(listId).appendChild(node);
}

function collectEntries(listId) {
  const out = [];
  $(listId)
    .querySelectorAll(".entry")
    .forEach((entry) => {
      const obj = {};
      entry.querySelectorAll("[data-f]").forEach((inp) => {
        obj[inp.dataset.f] = inp.value.trim();
      });
      // Skip entirely empty rows.
      if (Object.values(obj).some((v) => v)) out.push(obj);
    });
  return out;
}

/* ---- Load ---- */
async function load() {
  const K = RT.KEYS;

  const sel = $("model");
  RT.MODELS.forEach((m) => {
    const o = document.createElement("option");
    o.value = o.textContent = m;
    sel.appendChild(o);
  });

  const s = await RT.storage.get([
    K.apiKey, K.model, K.genPrompt, K.profile, K.folderName,
  ]);

  $("apiKey").value = s[K.apiKey] || "";
  $("model").value = s[K.model] || "gpt-4o";
  $("promptBox").value = s[K.genPrompt] || RT.DEFAULT_PROMPT;

  if (!RT.fs.supported()) {
    $("pickFolder").disabled = true;
    $("folderHint").textContent =
      "This browser does not support choosing a folder. Use a recent version of Chrome or Edge.";
  } else if (s[K.folderName]) {
    $("folderName").textContent = "Selected: " + s[K.folderName];
    $("folderHint").textContent =
      "Chrome may ask you to re-allow this folder once after a browser restart.";
  }

  const p = s[K.profile] || {};
  $("name").value = p.name || "";
  $("years").value = p.yearsExperience || "";
  $("email").value = p.email || "";
  $("phone").value = p.phone || "";
  $("location").value = p.location || "";
  $("linkedin").value = p.linkedin || "";
  $("website").value = p.website || "";
  $("skillsKnown").value = p.skillsKnown || "";

  const exp = (p.experience && p.experience.length) ? p.experience : [{}];
  exp.forEach((r) => addEntry("expList", "expTpl", r));

  const edu = (p.education && p.education.length) ? p.education : [{}];
  edu.forEach((e) => addEntry("eduList", "eduTpl", e));
}

/* ---- Folder picker ---- */
$("pickFolder").addEventListener("click", async () => {
  try {
    const handle = await RT.fs.pickFolder();
    await RT.storage.set({ [RT.KEYS.folderName]: handle.name });
    $("folderName").textContent = "Selected: " + handle.name;
    $("folderHint").textContent =
      "Chrome may ask you to re-allow this folder once after a browser restart.";
  } catch (e) {
    if (e && e.name === "AbortError") return; // user cancelled
    $("folderHint").textContent = "Could not select folder: " + (e.message || e);
  }
});

$("addExp").addEventListener("click", () => addEntry("expList", "expTpl", {}));
$("addEdu").addEventListener("click", () => addEntry("eduList", "eduTpl", {}));
$("resetPrompt").addEventListener("click", () => {
  $("promptBox").value = RT.DEFAULT_PROMPT;
});

/* ---- Save ---- */
$("saveBtn").addEventListener("click", async () => {
  const apiKey = $("apiKey").value.trim();
  const profile = {
    name: $("name").value.trim(),
    yearsExperience: $("years").value.trim(),
    email: $("email").value.trim(),
    phone: $("phone").value.trim(),
    location: $("location").value.trim(),
    linkedin: $("linkedin").value.trim(),
    website: $("website").value.trim(),
    skillsKnown: $("skillsKnown").value.trim(),
    experience: collectEntries("expList"),
    education: collectEntries("eduList"),
  };

  if (!apiKey) return status($("saveStatus"), "OpenAI API key is required.", "err");
  if (!profile.name) return status($("saveStatus"), "Full name is required.", "err");
  if (!profile.experience.length || !profile.experience[0].company)
    return status($("saveStatus"), "Add at least one work experience entry.", "err");

  await RT.storage.set({
    [RT.KEYS.apiKey]: apiKey,
    [RT.KEYS.model]: $("model").value,
    [RT.KEYS.genPrompt]: $("promptBox").value.trim() || RT.DEFAULT_PROMPT,
    [RT.KEYS.profile]: profile,
  });
  status($("saveStatus"), "Settings saved.", "ok");
});

load();
