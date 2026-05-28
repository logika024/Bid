/* Styled pdfmake template that mirrors the look of a typical modern
   resume-builder PDF (the user's CV_MiloradTrifunovic_SeniorSoftwareEngineer):

   - Large bold name, muted-gray headline, small gray contact line.
   - ALL-CAPS letter-spaced gray section headings, no underline.
   - Skills as bold "Category:" lines with comma-separated items below.
   - Experience entries with a big job title (left) + location (right gray),
     blue-accent company (left) + date (right gray), an optional gray
     description line, then bulleted achievements.
   - Bullets support inline bolding via **markdown** syntax — recommended for
     technical keywords and metric phrases. */
window.RT = window.RT || {};

const SP_PAGE_MARGIN_X = 50;
const SP_PAGE_MARGIN_Y = 42;

/* Colors. */
const C_TEXT      = "#222222";
const C_TEXT_DARK = "#1a1a1a";
const C_HEADING   = "#9a9a9a"; // muted gray for ALL CAPS section titles
const C_MUTED     = "#7f7f7f"; // dates / locations / contact line
const C_ACCENT    = "#5a8db5"; // company / school name accent (soft blue)
const C_DESC      = "#6a6a6a"; // company description line

/* --- Inline parser: turns "use **React** today" into pdfmake text runs --- */
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
  return {
    text: String(label).toUpperCase(),
    style: "section",
    margin: [0, 14, 0, 6],
  };
}

function dateRange(start, end) {
  return [start, end].filter(Boolean).join(" - ");
}

function experienceBlock(e, isLast) {
  const rows = [
    {
      columns: [
        { text: e.title || "", style: "jobTitle", width: "*" },
        {
          text: e.location || "",
          style: "rightMuted",
          alignment: "right",
          width: "auto",
          margin: [0, 6, 0, 0],
        },
      ],
    },
    {
      columns: [
        { text: e.company || "", style: "company", width: "*" },
        {
          text: dateRange(e.start, e.end),
          style: "rightMuted",
          alignment: "right",
          width: "auto",
          margin: [0, 2, 0, 0],
        },
      ],
      margin: [0, 1, 0, 0],
    },
  ];
  if (e.description) {
    rows.push({
      text: e.description,
      style: "descLine",
      margin: [0, 2, 0, 2],
    });
  }
  const bullets = (e.bullets || []).filter(Boolean);
  if (bullets.length) {
    rows.push({
      ul: bullets.map((b) => ({ text: parseInline(b), margin: [0, 0, 0, 1] })),
      style: "body",
      margin: [2, e.description ? 0 : 4, 0, 0],
    });
  }
  return { stack: rows, margin: [0, 6, 0, isLast ? 0 : 10] };
}

function educationBlock(ed, isLast) {
  const rows = [
    {
      columns: [
        { text: ed.degree || "", style: "jobTitle", width: "*" },
        {
          text: dateRange(ed.start, ed.end),
          style: "rightMuted",
          alignment: "right",
          width: "auto",
          margin: [0, 6, 0, 0],
        },
      ],
    },
    {
      columns: [
        { text: ed.school || "", style: "company", width: "*" },
        {
          text: ed.location || "",
          style: "rightMuted",
          alignment: "right",
          width: "auto",
          margin: [0, 2, 0, 0],
        },
      ],
      margin: [0, 1, 0, 0],
    },
  ];
  if (ed.details) {
    rows.push({ text: ed.details, style: "descLine", margin: [0, 2, 0, 0] });
  }
  return { stack: rows, margin: [0, 4, 0, isLast ? 0 : 8] };
}

RT.buildStyledDocDefinition = function (r) {
  r = r || {};
  const content = [];

  /* ---- Header ---- */
  content.push({ text: r.name || "", style: "name" });
  if (r.headline) content.push({ text: r.headline, style: "headline" });

  const c = r.contact || {};
  const contactParts = [
    c.email, c.linkedin, c.location, c.phone, c.website,
  ].filter(Boolean);
  if (contactParts.length) {
    content.push({ text: contactParts.join("   "), style: "contact" });
  }

  /* ---- Sections (fixed order, like the reference CV) ---- */
  if (r.summary) {
    content.push(sectionHeading("Summary"));
    content.push({ text: r.summary, style: "body" });
  }

  if (Array.isArray(r.skills) && r.skills.length) {
    content.push(sectionHeading("Skills"));
    r.skills.forEach((g, i) => {
      content.push({
        text: (g.category || "") + ":",
        style: "skillCat",
        margin: [0, i === 0 ? 0 : 8, 0, 2],
      });
      content.push({
        text: (g.items || []).filter(Boolean).join(", "),
        style: "body",
      });
    });
  }

  if (Array.isArray(r.experience) && r.experience.length) {
    content.push(sectionHeading("Experience"));
    r.experience.forEach((e, i) =>
      content.push(experienceBlock(e, i === r.experience.length - 1))
    );
  }

  if (Array.isArray(r.education) && r.education.length) {
    content.push(sectionHeading("Education"));
    r.education.forEach((ed, i) =>
      content.push(educationBlock(ed, i === r.education.length - 1))
    );
  }

  return {
    pageSize: "A4",
    pageMargins: [SP_PAGE_MARGIN_X, SP_PAGE_MARGIN_Y, SP_PAGE_MARGIN_X, SP_PAGE_MARGIN_Y],
    content,
    defaultStyle: {
      font: "Roboto",
      fontSize: 9.5,
      lineHeight: 1.28,
      color: C_TEXT,
    },
    styles: {
      name:      { fontSize: 26, bold: true, color: C_TEXT_DARK, margin: [0, 0, 0, 2] },
      headline:  { fontSize: 13, color: "#444444", margin: [0, 0, 0, 6] },
      contact:   { fontSize: 9, color: C_MUTED, margin: [0, 0, 0, 4] },
      section:   { fontSize: 10, bold: true, color: C_HEADING, characterSpacing: 1.2 },
      skillCat:  { fontSize: 10.5, bold: true, color: C_TEXT_DARK },
      body:      { fontSize: 9.5, color: C_TEXT },
      jobTitle:  { fontSize: 14, bold: true, color: C_TEXT_DARK },
      company:   { fontSize: 10.5, color: C_ACCENT },
      rightMuted:{ fontSize: 9, color: C_MUTED },
      descLine:  { fontSize: 9.5, color: C_DESC },
    },
  };
};
