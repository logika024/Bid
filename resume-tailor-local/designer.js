/* Designer: paste a resume JSON, preview the styled template live, and
   download the PDF. Used to validate the styled template against the
   user's original CV before wiring it into the main generation flow. */

const $ = (id) => document.getElementById(id);
let lastBlobUrl = null;

function setStatus(msg, kind) {
  const el = $("status");
  el.className = "status" + (kind ? " " + kind : "");
  el.textContent = msg || "";
}

function loadSample() {
  $("jsonInput").value = JSON.stringify(RT.SAMPLE_RESUME, null, 2);
}

function parseInput() {
  try {
    const resume = JSON.parse($("jsonInput").value);
    if (!resume || typeof resume !== "object") throw new Error("not an object");
    return resume;
  } catch (e) {
    setStatus("Invalid JSON: " + e.message, "err");
    return null;
  }
}

function render() {
  const resume = parseInput();
  if (!resume) return;

  setStatus("Rendering…", "busy");
  try {
    const doc = RT.buildStyledDocDefinition(resume);
    pdfMake.createPdf(doc).getBlob((blob) => {
      if (lastBlobUrl) URL.revokeObjectURL(lastBlobUrl);
      lastBlobUrl = URL.createObjectURL(blob);
      $("preview").src = lastBlobUrl;
      setStatus("Rendered.", "ok");
    });
  } catch (e) {
    setStatus("Render failed: " + (e.message || e), "err");
  }
}

function download() {
  const resume = parseInput();
  if (!resume) return;
  try {
    const doc = RT.buildStyledDocDefinition(resume);
    const safeName =
      (resume.name || "resume").replace(/[\\/:*?"<>|]+/g, " ").trim() +
      "_styled.pdf";
    pdfMake.createPdf(doc).download(safeName);
  } catch (e) {
    setStatus("Download failed: " + (e.message || e), "err");
  }
}

$("sampleBtn").addEventListener("click", () => {
  loadSample();
  render();
});
$("renderBtn").addEventListener("click", render);
$("downloadBtn").addEventListener("click", download);

/* Auto-load the sample and render on first open. */
loadSample();
render();
