/* Styled pdfmake document definition mirroring the reference CV.
   Browser ES-module version — identical layout to the Electron app's
   src/pdf-template.js. */

const SP_PAGE_MARGIN_X = 46;
const SP_PAGE_MARGIN_Y = 34;

const C_TEXT = "#222222";
const C_TEXT_DARK = "#1a1a1a";
const C_HEADING = "#9a9a9a";
const C_MUTED = "#7f7f7f";
const C_ACCENT = "#5a8db5";
const C_DESC = "#6a6a6a";

function parseInline(str) {
  const out = [];
  String(str || "")
    .split(/(\*\*[^*]+\*\*)/g)
    .forEach((p) => {
      if (!p) return;
      if (p.length > 4 && p.startsWith("**") && p.endsWith("**")) {
        out.push({ text: p.slice(2, -2), bold: true });
      } else {
        out.push({ text: p });
      }
    });
  return out.length ? out : [{ text: "" }];
}

function sectionHeading(label) {
  return { text: String(label).toUpperCase(), style: "section", margin: [0, 10, 0, 4] };
}

function dateRange(start, end) {
  return [start, end].filter(Boolean).join(" - ");
}

function experienceBlock(e, isLast) {
  const rows = [
    {
      columns: [
        { text: e.title || "", style: "jobTitle", width: "*" },
        { text: e.location || "", style: "rightMuted", alignment: "right", width: "auto", margin: [0, 6, 0, 0] },
      ],
    },
    {
      columns: [
        { text: e.company || "", style: "company", width: "*" },
        { text: dateRange(e.start, e.end), style: "rightMuted", alignment: "right", width: "auto", margin: [0, 2, 0, 0] },
      ],
      margin: [0, 1, 0, 0],
    },
  ];
  if (e.description) rows.push({ text: e.description, style: "descLine", margin: [0, 2, 0, 2] });
  const bullets = (e.bullets || []).filter(Boolean);
  if (bullets.length) {
    rows.push({
      ul: bullets.map((b) => ({ text: parseInline(b), margin: [0, 0, 0, 1] })),
      style: "body",
      margin: [2, e.description ? 0 : 4, 0, 0],
    });
  }
  return { stack: rows, margin: [0, 4, 0, isLast ? 0 : 7] };
}

function educationBlock(ed, isLast) {
  const rows = [
    {
      columns: [
        { text: ed.degree || "", style: "jobTitle", width: "*" },
        { text: dateRange(ed.start, ed.end), style: "rightMuted", alignment: "right", width: "auto", margin: [0, 6, 0, 0] },
      ],
    },
    {
      columns: [
        { text: ed.school || "", style: "company", width: "*" },
        { text: ed.location || "", style: "rightMuted", alignment: "right", width: "auto", margin: [0, 2, 0, 0] },
      ],
      margin: [0, 1, 0, 0],
    },
  ];
  if (ed.details) rows.push({ text: ed.details, style: "descLine", margin: [0, 2, 0, 0] });
  return { stack: rows, margin: [0, 3, 0, isLast ? 0 : 6] };
}

export function buildStyledDocDefinition(r) {
  r = r || {};
  const content = [];

  content.push({ text: r.name || "", style: "name" });
  if (r.headline) content.push({ text: r.headline, style: "headline" });

  const c = r.contact || {};
  const contactParts = [c.email, c.phone, c.address, c.linkedin, c.github, c.website].filter(Boolean);
  if (contactParts.length) content.push({ text: contactParts.join("   "), style: "contact" });

  if (r.summary) {
    content.push(sectionHeading("Summary"));
    content.push({ text: r.summary, style: "body" });
  }

  if (Array.isArray(r.skills) && r.skills.length) {
    content.push(sectionHeading("Skills"));
    r.skills.forEach((g, i) => {
      content.push({ text: (g.category || "") + ":", style: "skillCat", margin: [0, i === 0 ? 0 : 5, 0, 1] });
      content.push({ text: (g.items || []).filter(Boolean).join(", "), style: "body" });
    });
  }

  if (Array.isArray(r.experience) && r.experience.length) {
    content.push(sectionHeading("Experience"));
    r.experience.forEach((e, i) => content.push(experienceBlock(e, i === r.experience.length - 1)));
  }

  if (Array.isArray(r.education) && r.education.length) {
    content.push(sectionHeading("Education"));
    r.education.forEach((ed, i) => content.push(educationBlock(ed, i === r.education.length - 1)));
  }

  return {
    pageSize: "A4",
    pageMargins: [SP_PAGE_MARGIN_X, SP_PAGE_MARGIN_Y, SP_PAGE_MARGIN_X, SP_PAGE_MARGIN_Y],
    content,
    defaultStyle: { font: "Roboto", fontSize: 9, lineHeight: 1.16, color: C_TEXT },
    styles: {
      name: { fontSize: 23, bold: true, color: C_TEXT_DARK, margin: [0, 0, 0, 2] },
      headline: { fontSize: 12.5, color: "#444444", margin: [0, 0, 0, 5] },
      contact: { fontSize: 8.5, color: C_MUTED, margin: [0, 0, 0, 3] },
      section: { fontSize: 9.5, bold: true, color: C_HEADING, characterSpacing: 1.2 },
      skillCat: { fontSize: 10, bold: true, color: C_TEXT_DARK },
      body: { fontSize: 9, color: C_TEXT },
      jobTitle: { fontSize: 13, bold: true, color: C_TEXT_DARK },
      company: { fontSize: 10, color: C_ACCENT },
      rightMuted: { fontSize: 8.5, color: C_MUTED },
      descLine: { fontSize: 9, color: C_DESC },
    },
  };
}
