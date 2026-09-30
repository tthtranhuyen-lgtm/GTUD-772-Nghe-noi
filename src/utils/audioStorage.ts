/**
 * Client-side IndexedDB + Firebase Firestore Audio Storage
 * Supports storing large audio recordings safely locally and syncing across devices (teacher <-> students).
 */
import { db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const DB_NAME = 'EduListenAudioDB';
const DB_VERSION = 1;
const STORE_NAME = 'audio_recordings';

// In-memory fallback if IndexedDB is unavailable
const memoryCache = new Map<string, Blob>();

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    try {
      if (typeof window === 'undefined' || !window.indexedDB) {
        reject(new Error('IndexedDB not supported'));
        return;
      }

      const request = window.indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = () => {
        try {
          const idb = request.result;
          if (!idb.objectStoreNames.contains(STORE_NAME)) {
            idb.createObjectStore(STORE_NAME);
          }
        } catch (e) {
          reject(e);
        }
      };

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(request.error);
      };
    } catch (err) {
      reject(err);
    }
  });
}

export function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export function dataUrlToBlob(dataUrl: string): Blob {
  const parts = dataUrl.split(',');
  const mime = parts[0].match(/:(.*?);/)?.[1] || 'audio/webm';
  const binaryString = atob(parts[1]);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return new Blob([bytes], { type: mime });
}

export async function saveAudioRecording(id: string, blob: Blob): Promise<string> {
  memoryCache.set(id, blob);

  // 1. Save to local IndexedDB
  try {
    const idb = await openDB();
    await new Promise<void>((resolve, reject) => {
      const tx = idb.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(blob, id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('Local IndexedDB audio save fallback:', err);
  }

  // 2. Sync to Firebase Firestore so teacher and student can hear each other across devices!
  try {
    const dataUrl = await blobToDataUrl(blob);
    // Only upload if payload size is within safe document limit (< 900KB)
    if (dataUrl.length < 900000) {
      await setDoc(
        doc(db, 'audio_recordings', id),
        {
          id,
          dataUrl,
          mimeType: blob.type || 'audio/webm',
          createdAt: Date.now()
        },
        { merge: true }
      );
    }
  } catch (err) {
    console.warn('Could not sync audio recording to Firestore:', err);
  }

  return id;
}

export async function getAudioRecording(id: string): Promise<Blob | null> {
  // 1. Check in-memory cache
  if (memoryCache.has(id)) {
    return memoryCache.get(id) || null;
  }

  // 2. Check local IndexedDB
  try {
    const idb = await openDB();
    const localBlob = await new Promise<Blob | null>((resolve, reject) => {
      const tx = idb.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(id);
      req.onsuccess = () => resolve((req.result as Blob) || null);
      req.onerror = () => reject(req.error);
    });

    if (localBlob) {
      memoryCache.set(id, localBlob);
      return localBlob;
    }
  } catch (err) {
    console.warn('Could not read from IndexedDB, checking cloud:', err);
  }

  // 3. Fallback: Fetch from Firebase Firestore (for cross-device sharing between teacher & students)
  try {
    const docSnap = await getDoc(doc(db, 'audio_recordings', id));
    if (docSnap.exists()) {
      const data = docSnap.data();
      if (data && data.dataUrl) {
        const cloudBlob = dataUrlToBlob(data.dataUrl);
        memoryCache.set(id, cloudBlob);

        // Cache into local IndexedDB for instant playback next time
        try {
          const idb = await openDB();
          const tx = idb.transaction(STORE_NAME, 'readwrite');
          tx.objectStore(STORE_NAME).put(cloudBlob, id);
        } catch (_) {}

        return cloudBlob;
      }
    }
  } catch (err) {
    console.warn('Could not fetch audio from Firestore:', err);
  }

  return null;
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
