import { stateManager } from './state.js';
import { TelemetryService } from './telemetry.js';

/**
 * @typedef {Object} KPIState
 * @property {number} occupancy Stadium occupancy percentage.
 * @property {number} density Crowd density metric.
 * @property {number} incidents Count of active operational incidents.
 * @property {number} health General stadium health index.
 */

/* ============================
   ERROR BOUNDARY HELPER
   ============================ */
function runWithBoundary(panelName, fn) {
  try {
    fn();
  } catch (error) {
    console.error(`[Error Boundary - ${panelName}] Error caught:`, error);
    showToast(`Error loading ${panelName}. Retrying...`, 'error');
    
    const fallbacks = {
      'Insights Feed': 'insights-list',
      'Alerts Feed': 'alerts-feed'
    };
    const elementId = fallbacks[panelName];
    if (elementId) {
      const el = document.getElementById(elementId);
      if (el) {
        el.innerHTML = `<div class="text-xs text-red p-2 border border-red/20 rounded">Failed to load ${panelName}. Please refresh.</div>`;
      }
    }
  }
}

/* ============================
   LOADING SCREEN
   ============================ */
const loadingMessages = [
  'Connecting neural networks...',
  'Initializing Crowd Intelligence Agent...',
  'Loading Security Copilot model...',
  'Syncing Digital Twin...',
  'Calibrating IoT sensor feeds...',
  'Activating Emergency Response protocols...',
  'Loading Transport Intelligence...',
  'Booting Sustainability monitors...',
  'Starting Tournament Operations...',
  'All agents online. System ready.'
];
let loadProgress = 0;
const loadFill = document.getElementById('loading-fill');
const loadStatus = document.getElementById('loading-status');
const loadScreen = document.getElementById('loading-screen');

function animateLoading() {
  runWithBoundary('Loading Screen', () => {
    if (loadProgress < loadingMessages.length) {
      if (loadStatus) loadStatus.textContent = loadingMessages[loadProgress];
      if (loadFill) loadFill.style.width = ((loadProgress + 1) / loadingMessages.length * 100) + '%';
      loadProgress++;
      setTimeout(animateLoading, 100);
    } else {
      setTimeout(() => { if (loadScreen) loadScreen.classList.add('hidden'); }, 300);
    }
  });
}
// Delay slightly until state finishes loading asynchronously
stateManager.initPromise.then(() => {
  animateLoading();
});

/* ============================
   CLOCK
   ============================ */
function updateClock() {
  runWithBoundary('Live Clock', () => {
    const clockEl = document.getElementById('live-clock');
    if (clockEl) {
      const now = new Date();
      clockEl.textContent = now.toTimeString().split(' ')[0];
    }
  });
}
setInterval(updateClock, 1000);
updateClock();

/* ============================
   TOAST SYSTEM
   ============================ */
export function showToast(msg, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const colors = {
    info: 'border-cyan/30 bg-cyan/10 text-cyan',
    success: 'border-green/30 bg-green/10 text-green',
    warning: 'border-amber/30 bg-amber/10 text-amber',
    error: 'border-red/30 bg-red/10 text-red'
  };
  const toast = document.createElement('div');
  toast.className = `toast ${colors[type] || colors.info}`;
  toast.textContent = msg;
  container.appendChild(toast);
  
  const announcer = document.getElementById('sr-announcer');
  if (announcer) {
    announcer.textContent = `${type.toUpperCase()}: ${msg}`;
  }
  
  setTimeout(() => toast.remove(), 4000);
}
window.showToast = showToast;

/* ============================
   INSIGHTS & ALERTS
   ============================ */
export function renderInsights() {
  runWithBoundary('Insights Feed', () => {
    const list = document.getElementById('insights-list');
    if (!list) return;
    
    const fragment = document.createDocumentFragment();
    const insights = stateManager.get('insights') || [];
    insights.forEach(i => {
      const item = document.createElement('div');
      item.className = 'flex gap-2 text-xs text-slate-300 leading-relaxed';
      
      const icon = document.createElement('i');
      icon.className = `fa-solid ${i.icon} ${i.color} mt-0.5 text-[10px] flex-shrink-0`;
      icon.setAttribute('aria-hidden', 'true');
      
      const textSpan = document.createElement('span');
      textSpan.textContent = i.text;
      
      item.appendChild(icon);
      item.appendChild(textSpan);
      fragment.appendChild(item);
    });
    list.replaceChildren(fragment);
  });
}

export function renderAlerts() {
  runWithBoundary('Alerts Feed', () => {
    const feed = document.getElementById('alerts-feed');
    if (!feed) return;
    
    const colors = { critical: 'border-l-red bg-red/5', warning: 'border-l-amber bg-amber/5', info: 'border-l-cyan bg-cyan/5' };
    const badges = { critical: 'badge-critical', warning: 'badge-warning', info: 'badge-info' };
    
    const fragment = document.createDocumentFragment();
    const alerts = stateManager.get('alerts') || [];
    alerts.forEach(a => {
      const item = document.createElement('div');
      item.className = `alert-item p-2.5 rounded-lg border-l-2 ${colors[a.type] || colors.info} text-xs`;
      
      const header = document.createElement('div');
      header.className = 'flex items-center justify-between mb-1';
      
      const badge = document.createElement('span');
      badge.className = `badge ${badges[a.type] || badges.info}`;
      badge.textContent = a.type;
      
      const timeSpan = document.createElement('span');
      timeSpan.className = 'text-[10px] text-slate-600';
      timeSpan.textContent = a.time;
      
      header.appendChild(badge);
      header.appendChild(timeSpan);
      
      const content = document.createElement('div');
      content.className = 'text-slate-300';
      content.textContent = a.text;
      
      item.appendChild(header);
      item.appendChild(content);
      fragment.appendChild(item);
    });
    feed.replaceChildren(fragment);
    
    const alertCount = document.getElementById('alert-count');
    if (alertCount) alertCount.textContent = alerts.length;
  });
}

document.addEventListener('DOMContentLoaded', () => {
  stateManager.initPromise.then(() => {
    renderInsights();
    renderAlerts();
  });
});

/* ============================
   DETERMINISTIC SIMULATION MODEL
   ============================ */
let tickCount = 0;

export function simulateCrowdDynamics(t) {
  const occupancy = 87 + Math.sin(t * 0.05) * 1.5;
  const density = 73 + Math.cos(t * 0.08) * 3;
  const health = 94 - Math.sin(t * 0.03) * 0.8;
  
  return {
    occupancy: Math.min(100, Math.max(0, occupancy)),
    density: Math.min(100, Math.max(0, density)),
    health: Math.min(100, Math.max(0, health))
  };
}

/* ============================
   UI UPDATE HELPER
   ============================ */
function updateKPIUI(kpis) {
  const elOccupancy = document.querySelector('[data-kpi="occupancy"]');
  const elDensity = document.querySelector('[data-kpi="density"]');
  const elHealth = document.querySelector('[data-kpi="health"]');

  if (elOccupancy) elOccupancy.textContent = kpis.occupancy.toFixed(0) + '%';
  if (elDensity) elDensity.textContent = kpis.density.toFixed(0);
  if (elHealth) elHealth.textContent = kpis.health.toFixed(0);

  const tickerDensity = document.querySelector('[data-ticker="density"]');
  const tickerOccupancy = document.querySelector('[data-ticker="occupancy"]');

  if (tickerDensity) tickerDensity.textContent = kpis.density.toFixed(0) + '%';
  if (tickerOccupancy) tickerOccupancy.textContent = kpis.occupancy.toFixed(0) + '%';
}

/* ============================
   TELEMETRY POLLING INIT
   ============================ */
const telemetryService = new TelemetryService({
  endpoint: '/api/v1/telemetry',
  pollingInterval: 3000,
  timeoutMs: 4000,
  maxRetries: 3,
  onData: (data) => {
    tickCount++;
    stateManager.set('kpis.occupancy', data.occupancy);
    stateManager.set('kpis.density', data.density);
    stateManager.set('kpis.health', data.health);
    updateKPIUI(data);
    _tickLocalParams();
  },
  onError: (err) => {
    tickCount++;
    // Fall back to local math simulation
    const simulated = simulateCrowdDynamics(tickCount);
    stateManager.set('kpis.occupancy', simulated.occupancy);
    stateManager.set('kpis.density', simulated.density);
    stateManager.set('kpis.health', simulated.health);
    updateKPIUI(simulated);
    _tickLocalParams();
  },
  onLoading: (isLoading) => {
    const statusText = document.getElementById('loading-status');
    if (statusText && isLoading) {
      statusText.textContent = 'Syncing real-time telemetry...';
    }
  }
});

function _tickLocalParams() {
  const zones = stateManager.get('zones') || [];
  zones.forEach((z, i) => {
    z.density = Math.min(1, Math.max(0.1, z.density + Math.sin(tickCount * 0.1 + i) * 0.02));
  });
  stateManager.set('zones', zones);

  const incidents = stateManager.get('incidents') || [];
  incidents.forEach((inc, i) => {
    if (inc.status !== 'resolved') {
      inc.confidence = Math.min(0.99, Math.max(0.1, inc.confidence + Math.cos(tickCount * 0.15 + i) * 0.02));
    }
  });
  stateManager.set('incidents', incidents);

  window.dispatchEvent(new CustomEvent('incidentsUpdated'));
  stateManager.saveAsync();
}

// Start telemetry service
stateManager.initPromise.then(() => {
  telemetryService.start();
});

// Occasional new alerts simulation (deterministic schedule)
setInterval(() => {
  runWithBoundary('Simulated Alerts Dispatcher', () => {
    const newAlertsList = [
      { text: 'Section 315 crowd density rising — monitoring', type: 'warning' },
      { text: 'Stall F7 merchandise restocked — 200 units', type: 'info' },
      { text: 'Parking Lot D gate sensor malfunction — maintenance notified', type: 'info' },
      { text: 'VIP entrance swipe card reader slow response', type: 'warning' },
      { text: 'Concourse N cleaning cycle completed', type: 'info' },
      { text: 'Weather update: wind increasing to 25km/h', type: 'info' },
    ];
    const alertIndex = tickCount % newAlertsList.length;
    const alert = { ...newAlertsList[alertIndex], time: 'Just now' };
    
    const alerts = stateManager.get('alerts') || [];
    alerts.unshift(alert);
    if (alerts.length > 10) alerts.pop();
    stateManager.set('alerts', alerts);
    renderAlerts();
  });
}, 15000);

/* ============================
   NAVIGATION & ACCESSIBILITY HANDLER
   ============================ */
const sidebarItems = document.querySelectorAll('.sidebar-item');
const views = document.querySelectorAll('.view');

export function navigateToView(viewId) {
  runWithBoundary('Navigation Controller', () => {
    sidebarItems.forEach(i => {
      const isActive = i.dataset.view === viewId;
      i.classList.toggle('active', isActive);
      i.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });

    views.forEach(v => v.classList.remove('active'));
    const target = document.getElementById('view-' + viewId);
    if (target) {
      target.classList.add('active');
      stateManager.set('currentView', viewId);

      const event = new CustomEvent('viewChanged', { detail: { viewId } });
      window.dispatchEvent(event);
    } else {
      showToast('Agent module initializing...', 'info');
    }
  });
}

sidebarItems.forEach(item => {
  item.addEventListener('click', () => {
    const viewId = item.dataset.view;
    if (viewId) navigateToView(viewId);
  });

  item.setAttribute('tabindex', '0');
  item.setAttribute('role', 'tab');
  item.setAttribute('aria-selected', item.classList.contains('active') ? 'true' : 'false');
  item.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      const viewId = item.dataset.view;
      if (viewId) navigateToView(viewId);
    }
  });
});

window.navigateToView = navigateToView;

document.addEventListener('DOMContentLoaded', () => {
  stateManager.initPromise.then(() => {
    const currentView = stateManager.get('currentView');
    if (currentView) {
      navigateToView(currentView);
    }
  });

  // Setup non-inline event listener for quick action buttons
  const quickActions = document.getElementById('quick-actions-container');
  if (quickActions) {
    quickActions.addEventListener('click', (e) => {
      const btn = e.target.closest('button');
      if (btn && btn.dataset.toastMsg) {
        showToast(btn.dataset.toastMsg, btn.dataset.toastType || 'info');
      }
    });
  }
});
