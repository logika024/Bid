/* Folder persistence + file writing via the File System Access API.

   A FileSystemDirectoryHandle cannot be stored in chrome.storage (not JSON),
   but it CAN be stored in IndexedDB and survives browser restarts. After a
   restart its permission resets to "prompt"; requestPermission() (called from
   a user gesture such as a button click) re-grants it. */
window.RT = window.RT || {};

const DB_NAME = "rt-fs";
const STORE = "handles";
const HANDLE_KEY = "saveDir";

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      req.result.createObjectStore(STORE);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function idbPut(key, value) {
  return openDB().then(
    (db) =>
      new Promise((resolve, reject) => {
        const tx = db.transaction(STORE, "readwrite");
        tx.objectStore(STORE).put(value, key);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      })
  );
}

function idbGet(key) {
  return openDB().then(
    (db) =>
      new Promise((resolve, reject) => {
        const tx = db.transaction(STORE, "readonly");
        const r = tx.objectStore(STORE).get(key);
        r.onsuccess = () => resolve(r.result || null);
        r.onerror = () => reject(r.error);
      })
  );
}

RT.fs = {
  /* True if the browser supports the File System Access API. */
  supported() {
    return typeof window.showDirectoryPicker === "function";
  },

  /* Show the OS folder picker and persist the chosen directory handle. */
  async pickFolder() {
    const handle = await window.showDirectoryPicker({ mode: "readwrite" });
    await idbPut(HANDLE_KEY, handle);
    return handle;
  },

  /* Retrieve the previously chosen directory handle (or null). */
  async getFolder() {
    return idbGet(HANDLE_KEY);
  },

  /* Ensure we can write into the folder; re-prompts if needed.
     Must be invoked from within a user gesture. */
  async ensureWritable(handle) {
    const opts = { mode: "readwrite" };
    if ((await handle.queryPermission(opts)) === "granted") return true;
    return (await handle.requestPermission(opts)) === "granted";
  },

  /* Write a Blob into the folder under the given file name. */
  async writeFile(handle, fileName, blob) {
    const fileHandle = await handle.getFileHandle(fileName, { create: true });
    const writable = await fileHandle.createWritable();
    await writable.write(blob);
    await writable.close();
  },
};
