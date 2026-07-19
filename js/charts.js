/* ============================
   CHART.JS CONFIGURATION & WRAPPER
   ============================ */

const chartDefaults = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    x: {
      grid: { color: 'rgba(255,255,255,0.03)' },
      ticks: { color: '#475569', font: { size: 9, family: 'Space Grotesk' } }
    },
    y: {
      grid: { color: 'rgba(255,255,255,0.03)' },
      ticks: { color: '#475569', font: { size: 9, family: 'Space Grotesk' } }
    }
  }
};

export let activeCharts = {};

/**
 * Destroys a specific Chart.js instance by key to prevent memory leaks.
 * @param {string} chartName Name key of the chart in activeCharts.
 * @returns {void}
 */
export function destroyChart(chartName) {
  if (activeCharts[chartName]) {
    activeCharts[chartName].destroy();
    delete activeCharts[chartName];
  }
}

/* ============================
   ERROR BOUNDARY HELPER
   ============================ */
function runChartBoundary(chartName, fn) {
  try {
    fn();
  } catch (error) {
    console.error(`[Error Boundary - Chart] Failed to initialize chart "${chartName}":`, error);
  }
}

/**
 * Initialises Chart.js instances for the Command Center view:
 * crowd trend line, security events bar, energy consumption line,
 * and medical response time bar.
 * Safe to call multiple times — skips already-initialised charts.
 * @returns {void}
 */
export function initCommandCharts() {
  runChartBoundary('crowdTrend', () => {
    const trendCtx = document.getElementById('chart-crowd-trend');
    if (trendCtx && !activeCharts.crowdTrend) {
      activeCharts.crowdTrend = new Chart(trendCtx, {
        type: 'line',
        data: {
          labels: Array.from({length:12}, (_,i) => `${60-i*5}m`),
          datasets: [{ data: [62,65,68,71,72,74,75,76,78,82,85,87], borderColor: '#00f0ff', backgroundColor: 'rgba(0,240,255,0.08)', fill: true, tension: 0.4, pointRadius: 0, borderWidth: 2 }]
        },
        options: { ...chartDefaults, scales: { ...chartDefaults.scales, y: { ...chartDefaults.scales.y, min: 50, max: 100 } } }
      });
    }
  });

  runChartBoundary('securityEvents', () => {
    const securityCtx = document.getElementById('chart-security-events');
    if (securityCtx && !activeCharts.securityEvents) {
      activeCharts.securityEvents = new Chart(securityCtx, {
        type: 'bar',
        data: {
          labels: ['Baggage','Perimeter','Crowd','Restricted','Behavior','Other'],
          datasets: [{ data: [2,1,3,0,1,1], backgroundColor: ['rgba(255,56,96,0.6)','rgba(255,184,0,0.6)','rgba(255,184,0,0.6)','rgba(0,240,255,0.3)','rgba(0,240,255,0.3)','rgba(0,240,255,0.3)'], borderRadius: 4, barThickness: 16 }]
        },
        options: chartDefaults
      });
    }
  });

  runChartBoundary('energy', () => {
    const energyCtx = document.getElementById('chart-energy');
    if (energyCtx && !activeCharts.energy) {
      activeCharts.energy = new Chart(energyCtx, {
        type: 'line',
        data: {
          labels: Array.from({length:12}, (_,i) => `${60-i*5}m`),
          datasets: [{ data: [4.8,4.7,4.6,4.5,4.4,4.3,4.3,4.2,4.2,4.1,4.2,4.2], borderColor: '#00ff88', backgroundColor: 'rgba(0,255,136,0.08)', fill: true, tension: 0.4, pointRadius: 0, borderWidth: 2 }]
        },
        options: { ...chartDefaults, scales: { ...chartDefaults.scales, y: { ...chartDefaults.scales.y, min: 3.5, max: 5.5 } } }
      });
    }
  });

  runChartBoundary('medical', () => {
    const medicalCtx = document.getElementById('chart-medical');
    if (medicalCtx && !activeCharts.medical) {
      activeCharts.medical = new Chart(medicalCtx, {
        type: 'bar',
        data: {
          labels: ['Incident 1','Incident 2','Incident 3','Incident 4','Incident 5','Incident 6'],
          datasets: [{ data: [1.8,2.1,1.5,2.4,3.1,2.4], backgroundColor: ctx => ctx.raw > 3 ? 'rgba(255,56,96,0.6)' : ctx.raw > 2.5 ? 'rgba(255,184,0,0.6)' : 'rgba(0,255,136,0.6)', borderRadius: 4, barThickness: 14 }]
        },
        options: { ...chartDefaults, scales: { ...chartDefaults.scales, y: { ...chartDefaults.scales.y, min: 0, max: 4 } } }
      });
    }
  });
}

/**
 * Initialises Chart.js instances for the Transport & Logistics view:
 * multi-lot parking fill-rate trend and per-gate exit congestion bar.
 * @returns {void}
 */
export function initTransportCharts() {
  runChartBoundary('parking', () => {
    const parkingCtx = document.getElementById('chart-parking');
    if (parkingCtx && !activeCharts.parking) {
      activeCharts.parking = new Chart(parkingCtx, {
        type: 'line',
        data: {
          labels: ['-120m','-90m','-60m','-30m','Now','+30m','+60m','+90m','+120m'],
          datasets: [
            { label: 'Lot A', data: [20,35,55,70,80,85,75,45,20], borderColor: '#00f0ff', tension: 0.4, pointRadius: 2, borderWidth: 1.5 },
            { label: 'Lot B', data: [15,28,45,60,72,78,68,40,15], borderColor: '#00ff88', tension: 0.4, pointRadius: 2, borderWidth: 1.5 },
            { label: 'Lot C', data: [25,40,62,78,90,92,82,55,25], borderColor: '#ffb800', tension: 0.4, pointRadius: 2, borderWidth: 1.5 }
          ]
        },
        options: { ...chartDefaults, plugins: { legend: { display: true, labels: { color: '#64748b', font: { size: 9 }, boxWidth: 12, padding: 8 } } } }
      });
    }
  });

  runChartBoundary('exitGates', () => {
    const exitCtx = document.getElementById('chart-exit-gates');
    if (exitCtx && !activeCharts.exitGates) {
      activeCharts.exitGates = new Chart(exitCtx, {
        type: 'bar',
        data: {
          labels: ['Gate A','Gate B','Gate C','Gate D','Gate E','VIP Exit'],
          datasets: [{ data: [82,45,28,68,22,35], backgroundColor: ctx => ctx.raw > 70 ? 'rgba(255,56,96,0.6)' : ctx.raw > 50 ? 'rgba(255,184,0,0.6)' : 'rgba(0,255,136,0.6)', borderRadius: 4, barThickness: 18 }]
        },
        options: { ...chartDefaults, scales: { ...chartDefaults.scales, y: { ...chartDefaults.scales.y, max: 100 } } }
      });
    }
  });
}

/**
 * Initialises the Vendor Operations Chart.js instance showing per-stall
 * inventory percentage and queue wait times side-by-side.
 * @returns {void}
 */
export function initVendorChart() {
  runChartBoundary('vendor', () => {
    const vendorCtx = document.getElementById('chart-vendor');
    if (vendorCtx && !activeCharts.vendor) {
      activeCharts.vendor = new Chart(vendorCtx, {
        type: 'bar',
        data: {
          labels: ['F1 Burgers','F2 Pizza','F3 Hot Dogs','F4 Drinks','F5 Snacks','F6 Beer','F7 Merch','F8 Coffee'],
          datasets: [
            { label: 'Inventory %', data: [82,65,22,71,88,54,73,90], backgroundColor: ctx => ctx.raw < 30 ? 'rgba(255,56,96,0.6)' : ctx.raw < 50 ? 'rgba(255,184,0,0.6)' : 'rgba(0,240,255,0.4)', borderRadius: 4, barThickness: 20 },
            { label: 'Queue (min)', data: [7,5,3,8,2,6,4,1], backgroundColor: 'rgba(0,255,136,0.3)', borderRadius: 4, barThickness: 20 }
          ]
        },
        options: { ...chartDefaults, plugins: { legend: { display: true, labels: { color: '#64748b', font: { size: 9 }, boxWidth: 12, padding: 8 } } } }
      });
    }
  });
}

/**
 * Initialises Chart.js instances for the Sustainability view:
 * energy breakdown doughnut chart and match-over-match carbon reduction bar.
 * @returns {void}
 */
export function initSustainabilityCharts() {
  runChartBoundary('energyBreakdown', () => {
    const energyBreakdownCtx = document.getElementById('chart-sustainability-energy');
    if (energyBreakdownCtx && !activeCharts.energyBreakdown) {
      activeCharts.energyBreakdown = new Chart(energyBreakdownCtx, {
        type: 'doughnut',
        data: {
          labels: ['HVAC','Lighting','Displays','Kitchen','Other'],
          datasets: [{ data: [38,22,18,14,8], backgroundColor: ['rgba(0,240,255,0.6)','rgba(0,255,136,0.6)','rgba(255,184,0,0.6)','rgba(255,56,96,0.4)','rgba(100,116,139,0.4)'], borderWidth: 0 }]
        },
        options: { responsive: true, maintainAspectRatio: false, cutout: '65%', plugins: { legend: { position: 'right', labels: { color: '#94a3b8', font: { size: 10, family: 'Space Grotesk' }, padding: 12, boxWidth: 10 } } } }
      });
    }
  });

  runChartBoundary('carbon', () => {
    const carbonCtx = document.getElementById('chart-carbon');
    if (carbonCtx && !activeCharts.carbon) {
      activeCharts.carbon = new Chart(carbonCtx, {
        type: 'bar',
        data: {
          labels: ['Target','Week 1','Week 2','Week 3','This Match','Projected'],
          datasets: [{ label: 'Carbon (tonnes)', data: [50,48,42,38,35,32], backgroundColor: ['rgba(100,116,139,0.3)','rgba(0,240,255,0.4)','rgba(0,240,255,0.4)','rgba(0,255,136,0.4)','rgba(0,255,136,0.6)','rgba(0,255,136,0.3)'], borderRadius: 4, barThickness: 24 }]
        },
        options: { ...chartDefaults, plugins: { legend: { display: false } } }
      });
    }
  });
}

/**
 * Initialises the Tournament Staff Chart.js instance showing a stacked bar
 * of security, volunteer, and medical personnel counts per deployment zone.
 * @returns {void}
 */
export function initStaffChart() {
  runChartBoundary('staff', () => {
    const staffCtx = document.getElementById('chart-staff');
    if (staffCtx && !activeCharts.staff) {
      activeCharts.staff = new Chart(staffCtx, {
        type: 'bar',
        data: {
          labels: ['Gate A','Gate B','Gate C','Gate D','Gate E','Concourse N','Concourse S','VIP','Field','Parking'],
          datasets: [
            { label: 'Security', data: [12,10,8,10,8,6,6,4,3,5], backgroundColor: 'rgba(0,240,255,0.5)', borderRadius: 3, barThickness: 12 },
            { label: 'Volunteers', data: [18,15,12,16,10,14,12,8,4,12], backgroundColor: 'rgba(0,255,136,0.4)', borderRadius: 3, barThickness: 12 },
            { label: 'Medical', data: [2,2,1,2,1,2,2,1,2,0], backgroundColor: 'rgba(255,56,96,0.4)', borderRadius: 3, barThickness: 12 }
          ]
        },
        options: { ...chartDefaults, plugins: { legend: { display: true, labels: { color: '#64748b', font: { size: 9 }, boxWidth: 10, padding: 8 } } }, scales: { ...chartDefaults.scales, x: { ...chartDefaults.scales.x, stacked: true }, y: { ...chartDefaults.scales.y, stacked: true } } }
      });
    }
  });
}

// Attach listener to load charts as views activate
window.addEventListener('viewChanged', (e) => {
  const viewId = e.detail.viewId;
  if (viewId === 'command') initCommandCharts();
  if (viewId === 'transport') initTransportCharts();
  if (viewId === 'vendor') initVendorChart();
  if (viewId === 'sustainability') initSustainabilityCharts();
  if (viewId === 'tournament') initStaffChart();
});

// Load command charts on startup
document.addEventListener('DOMContentLoaded', () => {
  initCommandCharts();
});
