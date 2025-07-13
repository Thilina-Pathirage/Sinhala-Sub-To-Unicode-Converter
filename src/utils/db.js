// src/utils/db.js
const DB_NAME = 'videoSrtDB';
const DB_VERSION = 1;
const VIDEO_STORE = 'videoStore';
const SRT_STORE = 'srtStore';

// Check if IndexedDB is available and functional
const isIndexedDBAvailable = () => {
  try {
    return typeof indexedDB !== 'undefined' && indexedDB !== null;
  } catch (e) {
    return false;
  }
};

// Check if we're in private browsing mode
const isPrivateBrowsing = async () => {
  try {
    if (!isIndexedDBAvailable()) return true;
    
    const testDB = indexedDB.open('__test_db__', 1);
    return new Promise((resolve) => {
      testDB.onerror = () => resolve(true);
      testDB.onsuccess = () => {
        testDB.result.close();
        indexedDB.deleteDatabase('__test_db__');
        resolve(false);
      };
    });
  } catch (e) {
    return true;
  }
};

// Initialize database with better error handling
export const initDB = () => {
  return new Promise(async (resolve, reject) => {
    // Check if IndexedDB is available
    if (!isIndexedDBAvailable()) {
      reject(new Error('IndexedDB is not available in this browser'));
      return;
    }

    // Check for private browsing mode
    if (await isPrivateBrowsing()) {
      reject(new Error('IndexedDB is disabled in private browsing mode'));
      return;
    }

    let request;
    try {
      request = indexedDB.open(DB_NAME, DB_VERSION);
    } catch (e) {
      reject(new Error(`Failed to open IndexedDB: ${e.message}`));
      return;
    }

    request.onerror = () => {
      const error = request.error;
      console.error('IndexedDB error:', error);
      
      // Handle specific error types
      if (error.name === 'QuotaExceededError') {
        reject(new Error('Storage quota exceeded. Please clear some space and try again.'));
      } else if (error.name === 'UnknownError' && error.message.includes('backing store')) {
        reject(new Error('Database access blocked. Please try refreshing the page or clearing browser data.'));
      } else if (error.name === 'VersionError') {
        reject(new Error('Database version conflict. Please refresh the page.'));
      } else {
        reject(new Error(`Database error: ${error.name} - ${error.message}`));
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      try {
        // Create video store
        if (!db.objectStoreNames.contains(VIDEO_STORE)) {
          db.createObjectStore(VIDEO_STORE, { keyPath: 'id' });
        }

        // Create SRT store
        if (!db.objectStoreNames.contains(SRT_STORE)) {
          db.createObjectStore(SRT_STORE, { keyPath: 'id' });
        }
      } catch (e) {
        console.error('Error creating object stores:', e);
        reject(new Error(`Failed to create database stores: ${e.message}`));
      }
    };

    request.onblocked = () => {
      reject(new Error('Database upgrade blocked. Please close other tabs and try again.'));
    };
  });
};

// Helper function to handle database operations with retry
const executeDBOperation = async (operation, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      return await operation();
    } catch (error) {
      console.warn(`Database operation failed (attempt ${i + 1}/${retries}):`, error);
      
      if (i === retries - 1) {
        throw error;
      }
      
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 100 * (i + 1)));
    }
  }
};

// Save video data with better error handling
export const saveVideo = async (videoBlob) => {
  return executeDBOperation(async () => {
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
      request.onerror = () => {
        const error = request.error;
        if (error.name === 'QuotaExceededError') {
          reject(new Error('Not enough storage space. Please free up space and try again.'));
        } else {
          reject(new Error(`Failed to save video: ${error.message}`));
        }
      };

      transaction.onerror = () => reject(new Error('Transaction failed'));
    });
  });
};

// Get video data with better error handling
export const getVideo = async () => {
  return executeDBOperation(async () => {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([VIDEO_STORE], 'readonly');
      const store = transaction.objectStore(VIDEO_STORE);
      const request = store.get('currentVideo');

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(new Error(`Failed to retrieve video: ${request.error.message}`));
    });
  });
};

// Save SRT data with better error handling
export const saveSrtData = async (srtData) => {
  return executeDBOperation(async () => {
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
      request.onerror = () => {
        const error = request.error;
        if (error.name === 'QuotaExceededError') {
          reject(new Error('Not enough storage space. Please free up space and try again.'));
        } else {
          reject(new Error(`Failed to save subtitle data: ${error.message}`));
        }
      };

      transaction.onerror = () => reject(new Error('Transaction failed'));
    });
  });
};

// Get SRT data with better error handling
export const getSrtData = async () => {
  return executeDBOperation(async () => {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([SRT_STORE], 'readonly');
      const store = transaction.objectStore(SRT_STORE);
      const request = store.get('currentSrt');

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(new Error(`Failed to retrieve subtitle data: ${request.error.message}`));
    });
  });
};

// Clear all data with better error handling
export const clearData = async () => {
  return executeDBOperation(async () => {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([VIDEO_STORE, SRT_STORE], 'readwrite');
      const videoStore = transaction.objectStore(VIDEO_STORE);
      const srtStore = transaction.objectStore(SRT_STORE);

      videoStore.clear();
      srtStore.clear();

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(new Error(`Failed to clear data: ${transaction.error.message}`));
    });
  });
};

// Utility function to check database health
export const checkDBHealth = async () => {
  try {
    await initDB();
    return { healthy: true, message: 'Database is working properly' };
  } catch (error) {
    return { healthy: false, message: error.message };
  }
};

// Fallback storage using localStorage (for when IndexedDB fails)
export const fallbackStorage = {
  saveVideo: async (videoBlob) => {
    throw new Error('Video storage not available in fallback mode');
  },
  
  getVideo: async () => {
    return null;
  },
  
  saveSrtData: async (srtData) => {
    try {
      localStorage.setItem('srtData', JSON.stringify({
        id: 'currentSrt',
        data: srtData,
        timestamp: new Date().getTime(),
      }));
    } catch (e) {
      throw new Error('Failed to save subtitle data to localStorage');
    }
  },
  
  getSrtData: async () => {
    try {
      const data = localStorage.getItem('srtData');
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  },
  
  clearData: async () => {
    localStorage.removeItem('srtData');
  }
};