/**
 * stores/db.js — IndexedDB persistence for session data
 * Stores completed reflection sessions locally in the browser.
 * Sessions can be listed, exported individually or in batch.
 *
 * Database: "navigator-sessions", object store: "sessions"
 * Key: sessionId (UUID v4)
 *
 * Used by: session.js (save), export page (list/export)
 */

const DB_NAME = 'navigator-sessions';
const DB_VERSION = 1;
const STORE_NAME = 'sessions';

/** Open (or create) the IndexedDB database */
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'sessionId' });
        store.createIndex('timestamp', 'timestamp', { unique: false });
        store.createIndex('mode', 'mode', { unique: false });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/** Save a session snapshot to IndexedDB */
export async function saveSession(sessionData) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).put(sessionData);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

/** List all saved sessions (most recent first) */
export async function listSessions() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const request = tx.objectStore(STORE_NAME).index('timestamp').getAll();
    request.onsuccess = () => resolve(request.result.reverse());
    request.onerror = () => reject(request.error);
  });
}

/** Get a single session by ID */
export async function getSession(sessionId) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const request = tx.objectStore(STORE_NAME).get(sessionId);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/** Delete a session by ID */
export async function deleteSession(sessionId) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).delete(sessionId);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

/** Export all sessions as a JSON string */
export async function exportAllSessions() {
  const sessions = await listSessions();
  return JSON.stringify(sessions, null, 2);
}

/**
 * Export sessions as CSV (flattened: one row per message/reflection).
 * Columns: sessionId, timestamp, mode, role, language, messageRole,
 * messageContent, topics, questionId, questionVersion
 */
export async function exportSessionsCSV() {
  const sessions = await listSessions();
  const rows = [
    ['sessionId', 'timestamp', 'mode', 'language', 'participantRole',
     'messageRole', 'messageContent', 'topics'].join(','),
  ];

  for (const s of sessions) {
    for (const msg of (s.messages || [])) {
      rows.push([
        s.sessionId,
        msg.timestamp || s.timestamp,
        s.mode,
        s.language,
        s.participant?.role || '',
        msg.role,
        `"${(msg.content || '').replace(/"/g, '""')}"`,
        (msg.topics || []).join(';'),
      ].join(','));
    }
  }

  return rows.join('\n');
}
