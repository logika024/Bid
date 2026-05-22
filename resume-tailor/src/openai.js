/* OpenAI Chat Completions: generate a tailored resume from a profile + JD. */
window.RT = window.RT || {};

const OPENAI_URL = "https://api.openai.com/v1/chat/completions";

async function chatJSON({ apiKey, model, system, user, temperature = 0.4 }) {
  let resp;
  try {
    resp = await fetch(OPENAI_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + apiKey,
      },
      body: JSON.stringify({
        model,
        temperature,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
      }),
    });
  } catch (e) {
    throw new Error("Network error reaching OpenAI: " + e.message);
  }

  const text = await resp.text();
  if (!resp.ok) {
    let msg = text;
    try {
      msg = JSON.parse(text).error?.message || text;
    } catch (_) {}
    throw new Error("OpenAI API error (" + resp.status + "): " + msg);
  }

  let data;
  try {
    data = JSON.parse(text);
  } catch (_) {
    throw new Error("OpenAI returned an unreadable response.");
  }
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error("OpenAI returned an empty response.");

  try {
    return JSON.parse(content);
  } catch (_) {
    throw new Error("OpenAI did not return valid JSON.");
  }
}

RT.openai = {
  /* Generate resume content (summary, skills, bullets) for a profile + JD.
     Returns { company, position, headline, summary, skills, experienceBullets }. */
  async generateResume({ apiKey, model, profile, jobDescription, genPrompt }) {
    const system = genPrompt + "\n\n---\n" + RT.OUTPUT_CONTRACT;

    // Roles are numbered so the model keeps experienceBullets in the same order.
    const roles = (profile.experience || [])
      .map((r, i) => {
        const period = [r.start, r.end].filter(Boolean).join(" – ");
        return (
          `Role ${i + 1}: ${r.title || ""} at ${r.company || ""}` +
          (r.location ? `, ${r.location}` : "") +
          (period ? ` (${period})` : "") +
          (r.notes ? `\n  Candidate notes: ${r.notes}` : "")
        );
      })
      .join("\n");

    const edu = (profile.education || [])
      .map((e) => {
        const period = [e.start, e.end].filter(Boolean).join(" – ");
        return `${e.degree || ""} — ${e.school || ""}` + (period ? ` (${period})` : "");
      })
      .join("\n");

    const user =
      "CANDIDATE PROFILE\n" +
      `Name: ${profile.name || ""}\n` +
      `Total years of experience: ${profile.yearsExperience || "(not specified)"}\n` +
      (profile.skillsKnown
        ? `Known skills / focus: ${profile.skillsKnown}\n`
        : "") +
      "\nWORK EXPERIENCE (most recent first):\n" +
      roles +
      "\n\nEDUCATION:\n" +
      edu +
      "\n\nJOB DESCRIPTION:\n" +
      jobDescription +
      "\n\nProduce experienceBullets with exactly " +
      (profile.experience || []).length +
      " arrays, one per role above, in the same order.";

    return chatJSON({ apiKey, model, system, user, temperature: 0.4 });
  },
};
