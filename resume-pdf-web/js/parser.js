/* Parses pasted plain-text resume content into the structured object consumed
   by pdf-template.js.  (Browser ES-module version — identical logic to the
   Electron app's src/parser.js.)

   Expected layout:
     <Name line>            (ignored — header name comes from Settings)
     Summary
       <paragraph>
     Skills
       Category: item, item, item
     Experience
       <Role Title>                 (often **bold**)
       <Company> | <start> – <end>  (company often **bold**)
       * bullet
     Education
       <School> / <Degree> / <years>
*/

const SECTION_NAMES = ["summary", "skills", "experience", "education"];

function stripBold(s) {
  return String(s || "").replace(/^\*\*\s*/, "").replace(/\s*\*\*$/, "").trim();
}

function isBullet(line) {
  return (/^\*\s+/.test(line) && !/^\*\*/.test(line)) || /^[-•]\s+/.test(line);
}

function stripBulletMarker(line) {
  return line.replace(/^\*\s+/, "").replace(/^[-•]\s+/, "").trim();
}

function splitSections(text) {
  const lines = String(text || "").replace(/\r\n/g, "\n").split("\n");
  const sections = { _preamble: [] };
  let current = "_preamble";
  for (const raw of lines) {
    const key = raw.trim().toLowerCase().replace(/[:]+$/, "");
    if (SECTION_NAMES.includes(key)) {
      current = key;
      sections[current] = sections[current] || [];
      continue;
    }
    sections[current].push(raw);
  }
  return sections;
}

function parseSummary(lines) {
  return (lines || []).map((l) => l.trim()).filter(Boolean).join(" ").trim();
}

function parseSkills(lines) {
  const groups = [];
  for (const raw of lines || []) {
    const t = raw.trim();
    if (!t) continue;
    const idx = t.indexOf(":");
    if (idx === -1) {
      if (groups.length) {
        groups[groups.length - 1].items.push(
          ...t.split(/\s*,\s*/).map((s) => s.trim()).filter(Boolean)
        );
      }
      continue;
    }
    groups.push({
      category: stripBold(t.slice(0, idx).trim()),
      items: t.slice(idx + 1).split(/\s*,\s*/).map((s) => s.trim()).filter(Boolean),
    });
  }
  return groups;
}

function parseCompanyLine(line) {
  const parts = line.split("|");
  const company = stripBold((parts[0] || "").trim());
  let start = "";
  let end = "";
  if (parts.length > 1) {
    const segs = parts.slice(1).join("|").trim()
      .split(/\s*[–—-]\s*/).map((s) => s.trim()).filter(Boolean);
    start = segs[0] || "";
    end = segs[1] || "";
  }
  return { company, start, end };
}

function parseExperience(lines) {
  const entries = [];
  let cur = null;
  let sawBullet = false;
  const pushCur = () => {
    if (cur && (cur.title || cur.company || cur.bullets.length)) entries.push(cur);
  };
  for (const raw of lines || []) {
    const t = raw.trim();
    if (!t) continue;
    if (isBullet(t)) {
      if (!cur) cur = { title: "", company: "", start: "", end: "", bullets: [] };
      cur.bullets.push(stripBulletMarker(t));
      sawBullet = true;
      continue;
    }
    if (!cur || sawBullet) {
      pushCur();
      cur = { title: stripBold(t), company: "", start: "", end: "", bullets: [] };
      sawBullet = false;
    } else if (cur && !cur.company && !sawBullet) {
      const parsed = parseCompanyLine(t);
      cur.company = parsed.company;
      cur.start = parsed.start;
      cur.end = parsed.end;
    } else {
      pushCur();
      cur = { title: stripBold(t), company: "", start: "", end: "", bullets: [] };
      sawBullet = false;
    }
  }
  pushCur();
  return entries;
}

function parseEducation(lines) {
  const clean = (lines || []).map((l) => l.trim()).filter(Boolean);
  const entries = [];
  let cur = {};
  const yearRe = /\b(19|20)\d{2}\b/;
  const pushCur = () => {
    if (cur && (cur.school || cur.degree)) entries.push(cur);
    cur = {};
  };
  for (const line of clean) {
    if (yearRe.test(line) && (cur.school || cur.degree)) {
      const segs = line.split(/\s*[–—-]\s*/).map((s) => s.trim()).filter(Boolean);
      cur.start = segs[0] || line;
      cur.end = segs[1] || "";
      pushCur();
    } else if (!cur.school) {
      cur.school = stripBold(line);
    } else if (!cur.degree) {
      cur.degree = stripBold(line);
    } else {
      cur.details = [cur.details, line].filter(Boolean).join(" ");
    }
  }
  pushCur();
  return entries;
}

export function parseResumeContent(text, name, contact) {
  const sections = splitSections(text);
  return {
    name: name || "",
    contact: contact || {},
    summary: parseSummary(sections.summary),
    skills: parseSkills(sections.skills),
    experience: parseExperience(sections.experience),
    education: parseEducation(sections.education),
  };
}
