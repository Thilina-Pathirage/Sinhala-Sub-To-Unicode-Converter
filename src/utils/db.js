// src/utils/db.js
const DB_NAME = 'videoSrtDB';
const DB_VERSION = 1;
const VIDEO_STORE = 'videoStore';
const SRT_STORE = 'srtStore';

export const initDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      reject(request.error);
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      // Create video store
      if (!db.objectStoreNames.contains(VIDEO_STORE)) {
        db.createObjectStore(VIDEO_STORE, { keyPath: 'id' });
      }

      // Create SRT store
      if (!db.objectStoreNames.contains(SRT_STORE)) {
        db.createObjectStore(SRT_STORE, { keyPath: 'id' });
      }
    };
  });
};

// Save video data
export const saveVideo = async (videoBlob) => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([VIDEO_STORE], 'readwrite');
    const store = transaction.objectStore(VIDEO_STORE);

    const item = {
      id: 'currentVideo',
      blob: videoBlob,
      timestamp: new Date().getTime(),
    };

    const request = store.put(item);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

// Get video data
export const getVideo = async () => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([VIDEO_STORE], 'readonly');
    const store = transaction.objectStore(VIDEO_STORE);
    const request = store.get('currentVideo');

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

// Save SRT data
export const saveSrtData = async (srtData) => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([SRT_STORE], 'readwrite');
    const store = transaction.objectStore(SRT_STORE);

    const item = {
      id: 'currentSrt',
      data: srtData,
      timestamp: new Date().getTime(),
    };

    const request = store.put(item);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

// Get SRT data
export const getSrtData = async () => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([SRT_STORE], 'readonly');
    const store = transaction.objectStore(SRT_STORE);
    const request = store.get('currentSrt');

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

// Clear all data
export const clearData = async () => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([VIDEO_STORE, SRT_STORE], 'readwrite');
    const videoStore = transaction.objectStore(VIDEO_STORE);
    const srtStore = transaction.objectStore(SRT_STORE);

    videoStore.clear();
    srtStore.clear();

    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
};