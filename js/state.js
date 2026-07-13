// Decoupled encrypted state management module for ArenaOne

const STATE_KEY = 'arenaone_state';
const TIMESTAMP_KEY = 'arenaone_state_timestamp';
const EXPIRATION_MS = 2 * 60 * 60 * 1000; // 2 hours

const SALT = new Uint8Array([86, 12, 99, 102, 54, 76, 122, 90, 43, 21, 88, 76, 54, 32, 90, 11]);
const PASSPHRASE = 'arenaone_metlife_stadium_2026';

let cryptoKey = null;

async function getCryptoKey() {
  if (cryptoKey) return cryptoKey;
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(PASSPHRASE),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );
  cryptoKey = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: SALT,
      iterations: 10000,
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

const defaultState = {
  currentView: 'command',
  kpis: { occupancy: 87, density: 73, incidents: 3, health: 94 },
  zones: [
    { name: 'Gate A', density: 0.89, trend: 'up', x: 0.72, y: 0.22 },
    { name: 'Gate B', density: 0.45, trend: 'down', x: 0.28, y: 0.18 },
    { name: 'Gate C', density: 0.32, trend: 'stable', x: 0.15, y: 0.55 },
    { name: 'Gate D', density: 0.78, trend: 'up', x: 0.85, y: 0.6 },
    { name: 'Gate E', density: 0.21, trend: 'down', x: 0.5, y: 0.88 },
    { name: 'Section 101-110', density: 0.65, trend: 'up', x: 0.35, y: 0.38 },
    { name: 'Section 111-120', density: 0.72, trend: 'stable', x: 0.55, y: 0.35 },
    { name: 'Section 201-210', density: 0.58, trend: 'down', x: 0.4, y: 0.52 },
    { name: 'Section 211-220', density: 0.81, trend: 'up', x: 0.65, y: 0.55 },
    { name: 'Concourse N', density: 0.55, trend: 'stable', x: 0.5, y: 0.25 },
    { name: 'Concourse S', density: 0.42, trend: 'down', x: 0.5, y: 0.75 },
    { name: 'VIP Lounge', density: 0.38, trend: 'stable', x: 0.82, y: 0.35 },
  ],
  incidents: [
    { id: 1, type: 'Unattended Baggage', location: 'Section 204, Row 12', confidence: 0.92, status: 'investigating', severity: 'critical', time: '2 min ago', ai: 'Object detected stationary for 4m32s. No owner within 15m radius. Recommend immediate visual inspection by nearest security team.' },
    { id: 2, type: 'Perimeter Alert', location: 'North Fence, Sector 7', confidence: 0.78, status: 'monitoring', severity: 'warning', time: '8 min ago', ai: 'Motion sensor triggered by large animal (likely deer). Camera feed confirms non-threat. Maintaining observation for 10 min window.' },
    { id: 3, type: 'Crowd Surge', location: 'Gate A Concourse', confidence: 0.85, status: 'responding', severity: 'warning', time: '5 min ago', ai: 'Density exceeding 0.85 p/m². Flow rate increasing. Recommend opening Gate C overflow and deploying 4 volunteers for crowd guidance.' },
  ],
  medicalIncidents: [
    { id: 1, type: 'Cardiac Distress', location: 'Section 117, Seat 24', severity: 'critical', status: 'responding', responseTime: '1:42', team: 'Med Team Alpha', route: 'Gate B → Corridor 3 → Section 117' },
    { id: 2, type: 'Dehydration', location: 'Section 205, Concourse', severity: 'moderate', status: 'resolved', responseTime: '3:15', team: 'Volunteer 47', route: 'Gate D → First Aid Station 2' },
    { id: 3, type: 'Minor Injury', location: 'Gate E Stairs', severity: 'low', status: 'responding', responseTime: '2:08', team: 'Med Team Bravo', route: 'Gate E → Medical Post 4' },
  ],
  alerts: [
    { text: 'Gate A congestion approaching threshold', type: 'warning', time: '1m ago' },
    { text: 'Unattended baggage at Section 204', type: 'critical', time: '2m ago' },
    { text: 'Med Team Alpha dispatched — cardiac', type: 'critical', time: '3m ago' },
    { text: 'Elevator B maintenance extended +15min', type: 'info', time: '8m ago' },
    { text: 'Parking Lot C reaching 90% capacity', type: 'warning', time: '12m ago' },
    { text: 'Food stall F3 — hot dog inventory low', type: 'info', time: '15m ago' },
  ],
  insights: [
    { icon: 'fa-users', color: 'text-amber', text: 'Gate A density rising 12%/hr. Overflow to Gate C recommended in 10 min.' },
    { icon: 'fa-bolt', color: 'text-green', text: 'HVAC Zone 3 optimization saving 45kW. Extending to Zone 5.' },
    { icon: 'fa-shield-halved', color: 'text-cyan', text: 'Security sweep complete in Sections 101-120. No anomalies.' },
    { icon: 'fa-utensils', color: 'text-amber', text: 'Stall F3 hot dog supply depleted in ~25 min. Redirecting to F5.' },
  ],
  scenarios: [
    { id: 'rain', name: 'Heavy Rain at Halftime', icon: 'fa-cloud-rain', risk: 'MEDIUM', impact: '62/100', desc: 'Simulate sudden severe weather during halftime break with 87k fans in venue.' },
    { id: 'metro', name: 'Metro Delay — 30 Minutes', icon: 'fa-train-subway', risk: 'HIGH', impact: '78/100', desc: 'Major metro line disruption during post-match exodus with 80k fans departing.' },
    { id: 'evac', name: 'Full Stadium Evacuation', icon: 'fa-person-running', risk: 'CRITICAL', impact: '95/100', desc: 'Complete evacuation triggered by structural alert or credible threat.' },
    { id: 'power', name: 'Partial Power Failure', icon: 'fa-plug-circle-exclamation', risk: 'HIGH', impact: '71/100', desc: 'Loss of power to Sections 201-220 and concourse lighting.' },
  ],
  scenarioResults: {
    rain: { title: 'Impact Analysis: Heavy Rain at Halftime', labels: ['Crowd Move','Shelter Cap','Vendor Impact','Delay Risk','Staff Need','Fan Comfort'], data: [72, 58, 45, 80, 65, 88], mitigation: ['Pre-position 2,000 ponchos at each concourse exit','Open covered zones B2 and B3 for shelter','Activate mobile food carts under cover','Delay second half by max 15 min per FIFA rules','Deploy 20 additional volunteers to concourse areas','Send multilingual weather advisory to all screens'], impact: 'MEDIUM', detail: 'Estimated 15-min delay. 12k fans affected. Poncho stock adequate for 40k fans.' },
    metro: { title: 'Impact Analysis: Metro Delay', labels: ['Exit Congestion','Bus Load','Parking Surge','Ride-share Wait','Fan Wait Time','Staff Overtime'], data: [92, 78, 85, 70, 88, 60], mitigation: ['Activate bus fleet standby — 8 additional buses','Redirect fans to alternate station (2km walk)','Open parking lots D and E for overflow','Cap ride-share pickup at Lot B with priority queue','Deploy wayfinding volunteers to all exit gates','Coordinate with city transit for express service'], impact: 'HIGH', detail: 'Post-match exit extended from 45 to 90+ min. 35k fans use metro. 20k redirected to buses.' },
    evac: { title: 'Impact Analysis: Full Evacuation', labels: ['Gate Throughput','Evac Time','Injury Risk','Panic Factor','Assembly Capacity','Re-entry Time'], data: [95, 88, 72, 80, 65, 90], mitigation: ['Open ALL 12 gates simultaneously (not just 8)','Activate emergency lighting and PA in 6 languages','Deploy all 156 volunteers to stairwells and corridors','Medical teams pre-positioned at assembly points','Assembly areas: Lots A, B, C — capacity 100k','Full re-entry scan required — estimate 2 hours'], impact: 'CRITICAL', detail: 'Full evacuation: 28-35 minutes. Injury risk elevated in first 10 min. All emergency protocols active.' },
    power: { title: 'Impact Analysis: Partial Power Failure', labels: ['Visibility','Safety Risk','Fan Panic','System Backup','Repair Time','Comms Impact'], data: [70, 65, 40, 82, 55, 60], mitigation: ['Emergency lighting activates within 2 seconds (battery backup)','Security teams deploy to affected sections with flashlights','Generator backup for essential systems within 30 seconds','Public address on backup power — multilingual reassurance','Electrician team en route — estimate 15 min repair','Mobile comms units deployed to Section 201-220'], impact: 'HIGH', detail: 'Affected area: Sections 201-220 (upper deck, ~15k fans). Backup power covers 70% of essential systems.' },
  },
  chatResponses: {
    'directions': 'To reach your seat, go through Gate B, take the first right on the concourse, then follow the blue signs to Section 115. It\'s approximately a 4-minute walk. Need wheelchair-accessible routing?',
    'food': 'The shortest queue right now is at Stall F5 (2 min wait) — they have burgers, pizza, and drinks. Stall F3 has the shortest walk from your section but a 8-min queue. Want me to guide you?',
    'transport': 'After the match, the fastest exit is Gate E — metro is 8 min wait, buses departing every 6 min from Lot B. If you\'re driving, Lot A has the fastest exit route via Route 3. I recommend leaving 10 min before full time.',
    'accessibility': 'The nearest accessible restroom is 20m to your left on the concourse. Elevator C is operational for upper deck access. Need me to activate audio navigation to guide you?',
    'parking': 'You\'re in Lot C, Row 14. After the match, exit via the north gate — it\'s the least congested route. Estimated drive-out time: 15 minutes. Alternative: Lot C south exit adds 5 min but avoids Route 3 traffic.',
    'default': 'I can help you with directions, finding food with short queues, transportation options, accessible facilities, parking info, merchandise locations, and match details. What would you like to know?'
  },
  chatHistory: []
};

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

      if (storedTime && now - parseInt(storedTime, 10) > EXPIRATION_MS) {
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
