// Decoupled encrypted state management module for ArenaOne
import { defaultState } from './config.js';
import { STATE_EXPIRATION_MS, PBKDF2_ITERATIONS } from './constants.js';

const STATE_KEY = 'arenaone_state';
const TIMESTAMP_KEY = 'arenaone_state_timestamp';

let cryptoKey = null;

function getSessionPassphrase() {
  let phrase = sessionStorage.getItem('arenaone_session_pass');
  if (!phrase) {
    const array = new Uint32Array(8);
    crypto.getRandomValues(array);
    phrase = Array.from(array, dec => dec.toString(36)).join('');
    sessionStorage.setItem('arenaone_session_pass', phrase);
  }
  return phrase;
}

async function getCryptoKey() {
  if (cryptoKey) return cryptoKey;
  const phrase = getSessionPassphrase();
  
  let saltStr = localStorage.getItem('arenaone_crypto_salt');
  let salt;
  if (saltStr) {
    salt = new Uint8Array(saltStr.split(',').map(Number));
  } else {
    salt = crypto.getRandomValues(new Uint8Array(16));
    localStorage.setItem('arenaone_crypto_salt', salt.toString());
  }

  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(phrase),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );
  cryptoKey = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
  return cryptoKey;
}

export async function encryptData(text) {
  const key = await getCryptoKey();
  const encoder = new TextEncoder();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    encoder.encode(text)
  );

  const ivBase64 = btoa(String.fromCharCode(...iv));
  const encryptedBase64 = btoa(String.fromCharCode(...new Uint8Array(encrypted)));
  return JSON.stringify({ iv: ivBase64, data: encryptedBase64 });
}

export async function decryptData(jsonStr) {
  const { iv: ivBase64, data: dataBase64 } = JSON.parse(jsonStr);
  const key = await getCryptoKey();
  
  const iv = new Uint8Array(atob(ivBase64).split('').map(c => c.charCodeAt(0)));
  const encrypted = new Uint8Array(atob(dataBase64).split('').map(c => c.charCodeAt(0)));

  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    encrypted
  );
  const decoder = new TextDecoder();
  return decoder.decode(decrypted);
}

class StateManager {
  constructor() {
    this.state = JSON.parse(JSON.stringify(defaultState));
    this.listeners = new Map();
    this.initPromise = this._loadStateAsync();
  }

  async _loadStateAsync() {
    try {
      const storedTime = localStorage.getItem(TIMESTAMP_KEY);
      const now = Date.now();

      if (storedTime && now - parseInt(storedTime, 10) > STATE_EXPIRATION_MS) {
        console.warn('ArenaOne state data expired. Reverting to defaultState.');
        this._clearStoredState();
        return;
      }

      const saved = localStorage.getItem(STATE_KEY);
      if (saved) {
        if (saved.includes('"iv"') && saved.includes('"data"')) {
          const decrypted = await decryptData(saved);
          const parsed = JSON.parse(decrypted);
          if (!parsed.chatHistory) parsed.chatHistory = [];
          this.state = parsed;
        } else {
          // Backward compatibility: Import raw state
          const parsed = JSON.parse(saved);
          if (!parsed.chatHistory) parsed.chatHistory = [];
          this.state = parsed;
          await this.saveAsync();
        }
      }
    } catch (e) {
      console.error('Failed to load encrypted state, reverting to default:', e);
      this.state = JSON.parse(JSON.stringify(defaultState));
      await this.saveAsync();
    }
  }

  _clearStoredState() {
    localStorage.removeItem(STATE_KEY);
    localStorage.removeItem(TIMESTAMP_KEY);
  }

  async saveAsync() {
    try {
      const serialized = JSON.stringify(this.state);
      const encrypted = await encryptData(serialized);
      localStorage.setItem(STATE_KEY, encrypted);
      localStorage.setItem(TIMESTAMP_KEY, Date.now().toString());
    } catch (e) {
      console.error('Failed to save encrypted state:', e);
    }
  }

  get(path) {
    const parts = path.split('.');
    let current = this.state;
    for (const part of parts) {
      if (current === undefined || current === null) return undefined;
      current = current[part];
    }
    return current;
  }

  set(path, value) {
    const parts = path.split('.');
    let current = this.state;
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (!(part in current)) {
        current[part] = {};
      }
      current = current[part];
    }
    const lastKey = parts[parts.length - 1];
    current[lastKey] = value;
    this.saveAsync();
    this.emit(path, value);
  }

  subscribe(path, callback) {
    if (!this.listeners.has(path)) {
      this.listeners.set(path, new Set());
    }
    this.listeners.get(path).add(callback);
    return () => this.unsubscribe(path, callback);
  }

  unsubscribe(path, callback) {
    const set = this.listeners.get(path);
    if (set) {
      set.delete(callback);
      if (set.size === 0) {
        this.listeners.delete(path);
      }
    }
  }

  emit(path, value) {
    const set = this.listeners.get(path);
    if (set) {
      set.forEach(cb => {
        try {
          cb(value);
        } catch (e) {
          console.error(`Error in state listener for ${path}:`, e);
        }
      });
    }
    window.dispatchEvent(new CustomEvent('stateUpdated', { detail: { path, value } }));
  }
}

export const stateManager = new StateManager();
window.stateManager = stateManager;

Object.defineProperty(window, 'state', {
  get: () => stateManager.state,
  set: (val) => {
    stateManager.state = val;
    stateManager.saveAsync();
  },
  configurable: true
});
window.saveState = () => stateManager.saveAsync();
