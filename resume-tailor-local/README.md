# Resume Tailor Local — Open-Model ATS Resume Generator

Same as the original Resume Tailor extension, but powered by a **local
open-source LLM** instead of OpenAI / GPT. No API key, no cloud calls,
nothing leaves your machine — the extension talks to an inference server
running on your computer (Ollama, LM Studio, llama.cpp, vLLM, LocalAI).

## What you get

- A profile form + JD-paste flow that generates a full, ATS-optimized resume.
- Output is a real, text-based PDF (selectable text — ATS parsers need this).
- The PDF auto-saves to a folder you pick on your computer.
- Quality comparable to GPT-4o when running a strong model
  (Qwen 2.5 32B / 72B, Llama 3.3 70B); usable on a laptop with 7B-class
  models (Qwen 2.5 7B, Llama 3.1 8B).

## Setup — option A: Ollama (recommended, easiest)

1. Install Ollama from <https://ollama.com>. It runs as a background service.
2. Pull a model. The default is Qwen 2.5 7B — a strong instruction-following
   model that produces clean JSON, runs on ~6 GB RAM:
   ```
   ollama pull qwen2.5:7b
   ```
   Or, if you have a decent GPU and want better quality:
   ```
   ollama pull qwen2.5:14b
   ollama pull llama3.1:8b
   ollama pull qwen2.5:32b      # needs ~24 GB VRAM
   ollama pull llama3.3:70b     # top tier; needs 48 GB+ VRAM
   ```
3. Ollama exposes an OpenAI-compatible endpoint at
   `http://localhost:11434/v1` automatically — no extra config.

## Setup — option B: LM Studio

1. Install LM Studio from <https://lmstudio.ai>.
2. Download a model from the in-app catalogue (e.g. *Qwen2.5-7B-Instruct*).
3. Open the **Local Server** tab → **Start Server**.
4. In the extension settings, set the base URL to
   `http://localhost:1234/v1` and the model name to whatever LM Studio shows.

## Setup — option C: llama.cpp / vLLM / LocalAI

Any server that speaks the OpenAI Chat Completions API works. Set:

- **Base URL** — typically `http://localhost:8080/v1` (llama.cpp) or whatever
  the server prints on startup.
- **Model name** — whatever your server reports for the loaded model.

## Install the extension

1. Open `chrome://extensions` in Chrome or Edge.
2. Turn on **Developer mode** (top-right).
3. Click **Load unpacked** and select the `resume-tailor-local` folder.
4. Pin the extension and open it → **⚙ Settings**.

## First-time configuration

In Settings, fill in:

1. **Local LLM server** — base URL (default `http://localhost:11434/v1`),
   model name (default `qwen2.5:7b`). Click **Test connection** to confirm
   the server is reachable and the model is loaded.
2. **Save folder** — click **Choose folder…** and pick any directory.
3. **Your details, work experience, education** — fill the profile form.
4. **Generation prompt** — pre-filled; editable.

Click **Save Settings**.

## Daily use

1. Click the extension icon.
2. Paste the full job description.
3. Click **Generate & Save Resume** — the PDF lands in your folder.

Keep the popup open while it generates. Local-model speed depends on your
hardware: ~30 s on a recent GPU with a 7B model; up to a few minutes on CPU
or with bigger models.

## Quality vs hardware — quick reference

| Model | Approx VRAM/RAM | Speed | Resume quality |
|-------|---------|-------|----------------|
| `phi3.5:3.8b`        | 4 GB   | very fast | basic, simpler bullets |
| `qwen2.5:7b`         | 6 GB   | fast      | good — recommended default |
| `llama3.1:8b`        | 6 GB   | fast      | good |
| `qwen2.5:14b`        | 10 GB  | medium    | noticeably better bullets |
| `mistral-nemo:12b`   | 9 GB   | medium    | strong |
| `qwen2.5:32b`        | 24 GB  | slow on CPU | near GPT-4o |
| `llama3.3:70b`       | 48 GB+ | needs GPU | GPT-4o-class |

For best ATS-score quality, use 14B or larger. 7B is the realistic minimum
that still produces clean structured JSON every time.

## How CORS works (you don't need to configure it)

Chrome extensions with `host_permissions` for `http://localhost:*/*` bypass
CORS for those hosts, so the extension talks to Ollama/LM Studio directly
without needing `OLLAMA_ORIGINS` or any other CORS workaround.

If you run the inference server on another machine (not localhost), edit
`manifest.json` and add that host's URL to `host_permissions`, then reload
the extension.

## Privacy

Everything — profile, JD, generated resume — stays on your computer. The
extension only talks to your local LLM server.

## Project layout

| Path | Purpose |
|------|---------|
| `manifest.json` | MV3 manifest, localhost host permissions |
| `popup.*` | JD input, generate, save/download UI |
| `options.*` | Settings, profile form, folder picker, connection test |
| `designer.*` | Live PDF preview sandbox (styled template) |
| `src/constants.js` | Generation prompt, output contract, model suggestions |
| `src/storage.js` | `chrome.storage` wrapper |
| `src/fs.js` | File System Access API helper |
| `src/llm.js` | OpenAI-compatible client for any local server |
| `src/pdf-template.js` | Plain resume template (current main flow) |
| `src/pdf-template-styled.js` | Styled resume template (used by designer) |
| `src/sample-resume.js` | Sample data for the designer |
| `lib/` | Bundled pdfmake |
