/* Renders a structured resume object into a pdfmake document definition.
   pdfmake produces real, selectable text (ATS-friendly) and the fixed
   template guarantees the layout is identical for every generated resume. */
window.RT = window.RT || {};

const PAGE_MARGIN = 40;
const CONTENT_WIDTH = 595.28 - PAGE_MARGIN * 2; // A4 width minus margins

function sectionHeading(title) {
  return {
    margin: [0, 9, 0, 3],
    stack: [
      { text: String(title).toUpperCase(), style: "section" },
      {
        canvas: [
          {
            type: "line",
            x1: 0, y1: 2, x2: CONTENT_WIDTH, y2: 2,
            lineWidth: 0.9, lineColor: "#333333",
          },
        ],
      },
    ],
  };
}

function dateRange(start, end) {
  return [start, end].filter(Boolean).join(" – ");
}

function experienceBlock(e, isLast) {
  const titleLine = [{ text: e.company || "", bold: true }];
  if (e.location) {
    titleLine.push({ text: ", " + e.location, italics: true, color: "#555555" });
  }
  const stack = [
    {
      columns: [
        { text: titleLine, width: "*" },
        {
          text: dateRange(e.start, e.end),
          width: "auto",
          alignment: "right",
          color: "#555555",
        },
      ],
    },
    { text: e.title || "", italics: true, margin: [0, 1, 0, 2] },
  ];
  const bullets = (e.bullets || []).filter(Boolean);
  if (bullets.length) stack.push({ ul: bullets, style: "bullet" });
  return { margin: [0, 4, 0, isLast ? 0 : 6], stack };
}

function projectBlock(p, isLast) {
  const titleLine = [{ text: p.name || "", bold: true }];
  if (p.link) titleLine.push({ text: "  " + p.link, color: "#555555" });
  const stack = [{ text: titleLine }];
  const bullets = (p.bullets || []).filter(Boolean);
  if (bullets.length) stack.push({ ul: bullets, style: "bullet" });
  return { margin: [0, 4, 0, isLast ? 0 : 6], stack };
}

function educationBlock(ed, isLast) {
  const degreeLine = [{ text: ed.degree || "" }];
  if (ed.details) {
    degreeLine.push({ text: "  —  " + ed.details, color: "#555555" });
  }
  return {
    margin: [0, 4, 0, isLast ? 0 : 5],
    stack: [
      {
        columns: [
          { text: ed.school || "", bold: true, width: "*" },
          {
            text: dateRange(ed.start, ed.end),
            width: "auto",
            alignment: "right",
            color: "#555555",
          },
        ],
      },
      { text: degreeLine, italics: true, margin: [0, 1, 0, 0] },
    ],
  };
}

RT.buildDocDefinition = function (r) {
  r = r || {};
  const content = [];

  /* ---- Header ---- */
  content.push({ text: r.name || "", style: "name" });
  if (r.headline) content.push({ text: r.headline, style: "headline" });

  const c = r.contact || {};
  const contactParts = [
    c.email, c.phone, c.location, c.linkedin, c.github, c.website,
  ].filter(Boolean);
  if (contactParts.length) {
    content.push({ text: contactParts.join("   |   "), style: "contact" });
  }

  /* ---- Sections, in the resume's own order ---- */
  const defaultOrder = [
    "summary", "skills", "experience", "projects", "education", "certifications",
  ];
  const order =
    Array.isArray(r.sectionOrder) && r.sectionOrder.length
      ? r.sectionOrder
      : defaultOrder;

  for (const sec of order) {
    if (sec === "summary" && r.summary) {
      content.push(sectionHeading("Summary"));
      content.push({ text: r.summary, style: "body" });
    }

    if (sec === "skills" && Array.isArray(r.skills) && r.skills.length) {
      content.push(sectionHeading("Technical Skills"));
      r.skills.forEach((g) => {
        content.push({
          margin: [0, 0, 0, 2],
          text: [
            { text: (g.category || "") + ": ", bold: true },
            { text: (g.items || []).filter(Boolean).join(", ") },
          ],
          style: "body",
        });
      });
    }

    if (sec === "experience" && Array.isArray(r.experience) && r.experience.length) {
      content.push(sectionHeading("Experience"));
      r.experience.forEach((e, i) =>
        content.push(experienceBlock(e, i === r.experience.length - 1))
      );
    }

    if (sec === "projects" && Array.isArray(r.projects) && r.projects.length) {
      content.push(sectionHeading("Projects"));
      r.projects.forEach((p, i) =>
        content.push(projectBlock(p, i === r.projects.length - 1))
      );
    }

    if (sec === "education" && Array.isArray(r.education) && r.education.length) {
      content.push(sectionHeading("Education"));
      r.education.forEach((ed, i) =>
        content.push(educationBlock(ed, i === r.education.length - 1))
      );
    }

    if (
      sec === "certifications" &&
      Array.isArray(r.certifications) &&
      r.certifications.length
    ) {
      content.push(sectionHeading("Certifications"));
      content.push({
        ul: r.certifications.filter(Boolean),
        style: "bullet",
      });
    }
  }

  return {
    pageSize: "A4",
    pageMargins: [PAGE_MARGIN, 36, PAGE_MARGIN, 36],
    content,
    defaultStyle: {
      font: "Roboto",
      fontSize: 9.5,
      lineHeight: 1.13,
      color: "#222222",
    },
    styles: {
      name: { fontSize: 21, bold: true, alignment: "center", margin: [0, 0, 0, 2] },
      headline: { fontSize: 10.5, alignment: "center", color: "#444444", margin: [0, 0, 0, 2] },
      contact: { fontSize: 8.5, alignment: "center", color: "#444444", margin: [0, 0, 0, 2] },
      section: { fontSize: 10.5, bold: true, color: "#1a1a1a" },
      body: { fontSize: 9.5 },
      bullet: { fontSize: 9.3 },
    },
  };
};

/* Local timestamp as YYYY-MM-DD_HHMM. */
RT.timestamp = function () {
  const d = new Date();
  const p = (n) => String(n).padStart(2, "0");
  return (
    d.getFullYear() +
    "-" + p(d.getMonth() + 1) +
    "-" + p(d.getDate()) +
    "_" + p(d.getHours()) + p(d.getMinutes())
  );
};

/* Build a safe PDF file name: "<Company>_<Position>_<timestamp>.pdf" */
RT.buildFileName = function (company, position) {
  const clean = (s) =>
    String(s || "")
      .replace(/[\\/:*?"<>|]+/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .replace(/ /g, "-");
  const name = [clean(company), clean(position), RT.timestamp()]
    .filter(Boolean)
    .join("_");
  return (name || "resume") + ".pdf";
};
