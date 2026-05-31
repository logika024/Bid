# Resume PDF Generator — Web

A browser-based version of the resume PDF generator. Paste resume content,
get a **live PDF preview**, and save to two folders — all in the browser, no
Electron. PDFs are generated client-side with pdfmake; folder saving uses the
**File System Access API** (Chrome / Edge).

## Run

```bash
cd resume-pdf-web
npm start          # serves http://localhost:5173
```

Then open **http://localhost:5173** in **Chrome or Edge**.

> A server (localhost) is required because the File System Access API only
> works in a secure context — opening `index.html` directly as a `file://`
> page disables folder saving. `npm start` runs a tiny static Node server with
> no dependencies.

## First-time setup — Settings (⚙ top-right)

- **Full Name** (required) — name shown at the top of the resume header.
- **Email / Phone / Address** — contact line under your name.
- **LinkedIn / GitHub / Website** — optional, added if filled.
- **CV file name** (required) — the fixed name for the CV-folder file (under
  the CV folder card). Set once per profile.
- **Save Folders** — click **Connect folder…** for each. The browser asks you
  to pick a folder and grant write access. The folders are remembered between
  sessions (stored as handles in IndexedDB); after a browser restart you may be
  re-prompted to allow access the first time you save — that's expected.

Click **Save Settings**. Personal details are stored in `localStorage`.

The two status pills in the top bar show folder connection at a glance
(gray = not connected, green = ready, amber = connected but needs you to
re-allow access).

## Generate

1. **Job Title** + **Company Name** (used for the All-generated file name).
2. Paste **Resume Content** (name line, then Summary / Skills / Experience /
   Education — see the example content file in the repo root). The preview
   updates as you type.
3. **Generate & Save** writes the same PDF to both folders:

| Folder        | Filename                              | Notes                          |
| ------------- | ------------------------------------- | ------------------------------ |
| All generated | `Company - Job Title - timestamp.pdf` | unique archive copy every time |
| CV folder     | `<CV file name>.pdf`                  | overwrites the same name       |

The **CV file name** is a stable "profile" name set once in **Settings** (under
the CV folder). `.pdf` is added automatically and the file is **overwritten**
if it already exists, so each generation updates that fixed copy in place.

The **↻ Preview** button forces a re-render; **⬇ Download** saves the
previewed PDF via the browser's normal download.

## Fallback

If folders aren't connected (or the browser lacks the File System Access API,
e.g. Firefox / Safari), **Generate & Save** falls back to downloading the two
correctly-named files instead of writing to folders.

## Project layout

```
index.html              Two-pane UI (form + live preview) and settings drawer
css/styles.css          Styling
js/app.js               Controller: settings, folders, preview, save
js/parser.js            Plain-text resume content -> structured object
js/pdf-template.js      pdfmake document definition (the styled layout)
js/fs-store.js          File System Access API + IndexedDB handle storage
lib/pdfmake.min.js      pdfmake (browser build)
lib/vfs_fonts.js        Roboto fonts for pdfmake
server.js               Minimal static server (localhost secure context)
```

Shares the exact parser and PDF template logic with the Electron app in
`../resume-pdf-generator`.
