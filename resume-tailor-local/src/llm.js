/* OpenAI-compatible client for a LOCAL inference server: Ollama, LM Studio,
   llama.cpp server, vLLM, LocalAI, etc. The API shape is the same as OpenAI's
   Chat Completions endpoint, so the only thing that changes per server is the
   base URL and the model name. */
window.RT = window.RT || {};

function trimSlash(u) {
  return String(u || "").replace(/\/+$/, "");
}

async function chatJSON({ baseURL, apiKey, model, system, user, temperature = 0.4 }) {
  const url = trimSlash(baseURL) + "/chat/completions";
  const headers = { "Content-Type": "application/json" };
  if (apiKey) headers.Authorization = "Bearer " + apiKey;

  let resp;
  try {
    resp = await fetch(url, {
      method: "POST",
      headers,
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
    throw new Error(
      "Could not reach the inference server at " +
        url +
        " — is it running? (" + (e.message || e) + ")"
    );
  }

  const text = await resp.text();
  if (!resp.ok) {
    let msg = text;
    try {
      msg = JSON.parse(text).error?.message || text;
    } catch (_) {}
    throw new Error("Inference server error (" + resp.status + "): " + msg);
  }

  let data;
  try {
    data = JSON.parse(text);
  } catch (_) {
    throw new Error("Inference server returned an unreadable response.");
  }
  let content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error("Inference server returned an empty response.");

  /* Some local models occasionally wrap JSON in ```json ... ``` fences or
     prefix it with prose. Recover the JSON object before parsing. */
  content = String(content).trim();
  if (content.startsWith("```")) {
    content = content.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "");
  }
  const firstBrace = content.indexOf("{");
  const lastBrace = content.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    content = content.slice(firstBrace, lastBrace + 1);
  }

  try {
    return JSON.parse(content);
  } catch (_) {
    throw new Error(
      "The model did not return valid JSON. Try a stronger model " +
        "(e.g. qwen2.5:14b or llama3.1:8b)."
    );
  }
}

RT.llm = {
  /* List models the server has loaded — used by the "Test connection" button. */
  async listModels({ baseURL, apiKey }) {
    const url = trimSlash(baseURL) + "/models";
    const headers = {};
    if (apiKey) headers.Authorization = "Bearer " + apiKey;
    const r = await fetch(url, { headers });
    if (!r.ok) throw new Error("HTTP " + r.status);
    const j = await r.json();
    return (j.data || j.models || [])
      .map((m) => m.id || m.name)
      .filter(Boolean);
  },

  /* Same generation contract as the OpenAI version, just routed locally. */
  async generateResume({ baseURL, apiKey, model, profile, jobDescription, genPrompt }) {
    const system = genPrompt + "\n\n---\n" + RT.OUTPUT_CONTRACT;

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

    return chatJSON({
      baseURL, apiKey, model, system, user, temperature: 0.4,
    });
  },
};
