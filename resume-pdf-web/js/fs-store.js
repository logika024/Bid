/* Folder persistence + file writing via the File System Access API.

   A FileSystemDirectoryHandle can't be stored in localStorage (not JSON), but
   it CAN be stored in IndexedDB and survives browser restarts. After a restart
   its permission resets to "prompt"; requestPermission() (called from a user
   gesture such as a button click) re-grants it. */

const DB_NAME = "resume-pdf-web";
const STORE = "handles";

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
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

function idbDelete(key) {
  return openDB().then(
    (db) =>
      new Promise((resolve, reject) => {
        const tx = db.transaction(STORE, "readwrite");
        tx.objectStore(STORE).delete(key);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      })
  );
}

export const fsStore = {
  /* True if the browser supports the File System Access API (Chrome/Edge). */
  supported() {
    return typeof window.showDirectoryPicker === "function";
  },

  /* Show the OS folder picker and persist the chosen directory handle. */
  async pickFolder(key) {
    const handle = await window.showDirectoryPicker({ id: key, mode: "readwrite" });
    await idbPut(key, handle);
    return handle;
  },

  async getFolder(key) {
    return idbGet(key);
  },

  async forgetFolder(key) {
    return idbDelete(key);
  },

  /* Permission state without prompting: "granted" | "prompt" | "denied". */
  async permissionState(handle) {
    if (!handle) return "none";
    return handle.queryPermission({ mode: "readwrite" });
  },

  /* Ensure we can write; re-prompts if needed. Call from a user gesture. */
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
