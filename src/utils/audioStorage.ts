/**
 * Client-side IndexedDB Audio Storage
 * Supports storing large audio recordings (Blobs) safely without hitting localStorage quotas.
 */

const DB_NAME = 'EduListenAudioDB';
const DB_VERSION = 1;
const STORE_NAME = 'audio_recordings';

// In-memory fallback if IndexedDB is unavailable
const memoryCache = new Map<string, Blob>();

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

export async function saveAudioRecording(id: string, blob: Blob): Promise<string> {
  memoryCache.set(id, blob);
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(blob, id);
      req.onsuccess = () => resolve(id);
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('Falling back to memory cache for audio:', err);
    return id;
  }
}

export async function getAudioRecording(id: string): Promise<Blob | null> {
  if (memoryCache.has(id)) {
    return memoryCache.get(id) || null;
  }

  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(id);
      req.onsuccess = () => {
        const result = req.result as Blob | undefined;
        if (result) {
          memoryCache.set(id, result);
          resolve(result);
        } else {
          resolve(null);
        }
      };
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('Could not read from IndexedDB:', err);
    return memoryCache.get(id) || null;
  }
}

export async function getAudioObjectUrl(id: string): Promise<string | null> {
  const blob = await getAudioRecording(id);
  if (!blob) return null;
  return URL.createObjectURL(blob);
}

/**
 * Creates a synthetic demo voice WAV blob for seeded submissions
 * so teachers can immediately press Play and hear speech/tone without needing real recording first.
 */
export function createSampleAudioBlob(message: string): Blob {
  // Generate a valid short silent/pleasant audio tone WAV buffer
  const sampleRate = 22050;
  const durationSec = 2.5;
  const numSamples = Math.floor(sampleRate * durationSec);
  const buffer = new ArrayBuffer(44 + numSamples * 2);
  const view = new DataView(buffer);

  // RIFF identifier
  writeString(view, 0, 'RIFF');
  // file length
  view.setUint32(4, 36 + numSamples * 2, true);
  // RIFF type
  writeString(view, 8, 'WAVE');
  // format chunk identifier
  writeString(view, 12, 'fmt ');
  // format chunk length
  view.setUint32(16, 16, true);
  // sample format (raw PCM)
  view.setUint16(20, 1, true);
  // channel count (1)
  view.setUint16(22, 1, true);
  // sample rate
  view.setUint32(24, sampleRate, true);
  // byte rate (sampleRate * 1 * 16/8)
  view.setUint32(28, sampleRate * 2, true);
  // block align (1 * 16/8)
  view.setUint16(32, 2, true);
  // bits per sample
  view.setUint16(34, 16, true);
  // data chunk identifier
  writeString(view, 36, 'data');
  // data chunk length
  view.setUint32(40, numSamples * 2, true);

  // Write simple gentle tone melody
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const freq = 330 + Math.sin(t * 8) * 80;
    const amp = Math.sin(2 * Math.PI * freq * t) * Math.exp(-t * 0.8) * 0.4;
    view.setInt16(44 + i * 2, amp * 32767, true);
  }

  return new Blob([view], { type: 'audio/wav' });
}

function writeString(view: DataView, offset: number, string: string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}
