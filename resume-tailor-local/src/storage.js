/* Thin wrapper over chrome.storage.local. */
window.RT = window.RT || {};

RT.KEYS = {
  baseURL: "baseURL",         // OpenAI-compatible base URL of the local server
  apiKey: "apiKey",           // optional — some local servers require none
  model: "model",             // model name as the server knows it
  genPrompt: "genPrompt",     // editable generation prompt
  profile: "profile",         // candidate profile object (see below)
  folderName: "folderName",   // display name of the chosen save folder
  lastResult: "lastResult",   // { company, position, fileName, resume }
};

/*
profile = {
  name, email, phone, location, linkedin, website,
  yearsExperience: "string",
  skillsKnown: "string (optional, free text)",
  experience: [ { company, title, location, start, end, notes } ],
  education:  [ { school, degree, location, start, end } ]
}
*/

RT.storage = {
  get(keys) {
    return new Promise((resolve) =>
      chrome.storage.local.get(keys, (res) => resolve(res || {}))
    );
  },
  set(obj) {
    return new Promise((resolve) =>
      chrome.storage.local.set(obj, () => resolve())
    );
  },
  remove(keys) {
    return new Promise((resolve) =>
      chrome.storage.local.remove(keys, () => resolve())
    );
  },
};

/* True when a profile has at least a name and one role. */
RT.profileIsComplete = function (p) {
  return Boolean(
    p &&
      p.name &&
      Array.isArray(p.experience) &&
      p.experience.length &&
      p.experience[0].company
  );
};
