import { stateManager } from './state.js';
import { showToast } from './app.js';

/* ============================
   ERROR BOUNDARY HELPER
   ============================ */
function runWithBoundary(panelName, containerId, fn) {
  try {
    fn();
  } catch (error) {
    console.error(`[Error Boundary - ${panelName}] Failed to render:`, error);
    const container = document.getElementById(containerId);
    if (container) {
      container.innerHTML = `
        <div class="glass p-4 text-center border-red/20 border" role="alert">
          <i class="fa-solid fa-triangle-exclamation text-red text-lg mb-2" aria-hidden="true"></i>
          <div class="text-xs text-white font-semibold mb-1">Failed to load ${panelName}</div>
          <div class="text-[10px] text-slate-500">A rendering boundary caught a local module exception. Please try refreshing.</div>
        </div>`;
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  // Security Incident Feed rendering function (supports multiple concurrent incidents)
  function renderIncidents() {
    runWithBoundary('Security Incident Feed', 'incident-feed', () => {
      const incidentFeed = document.getElementById('incident-feed');
      if (incidentFeed) {
        const incidents = stateManager.get('incidents') || [];
        incidentFeed.innerHTML = incidents.map(inc => {
          const sevColors = { critical: 'badge-critical', warning: 'badge-warning', moderate: 'badge-warning', low: 'badge-info' };
          const statusColors = { investigating: 'text-amber', monitoring: 'text-cyan', responding: 'text-green', resolved: 'text-slate-400' };
          
          let timerHtml = '';
          if (inc.status !== 'resolved' && inc.timer !== undefined) {
            timerHtml = `<span class="text-[10px] text-amber ml-2"><i class="fa-regular fa-clock mr-0.5"></i>Resolving in ${inc.timer}s</span>`;
          }

          return `<div class="glass p-4 alert-item mb-3">
            <div class="flex items-center justify-between mb-2">
              <div class="flex items-center gap-2">
                <span class="badge ${sevColors[inc.severity] || 'badge-info'}">${inc.severity}</span>
                <span class="text-xs font-semibold text-white">${inc.type}</span>
              </div>
              <span class="text-[10px] text-slate-600">${inc.time}</span>
            </div>
            <div class="text-xs text-slate-400 mb-2">
              <i class="fa-solid fa-location-dot text-cyan mr-1"></i>${inc.location}
              ${timerHtml}
            </div>
            <div class="flex items-center gap-2 mb-2">
              <span class="text-[10px] text-slate-500">Confidence:</span>
              <div class="confidence-bar flex-1"><div class="confidence-fill" style="width:${inc.confidence*100}%;background:${inc.confidence>0.85?'var(--red)':inc.confidence>0.7?'var(--amber)':'var(--cyan)'}"></div></div>
              <span class="text-[10px] text-white font-semibold">${(inc.confidence*100).toFixed(0)}%</span>
            </div>
            <div class="text-[10px] uppercase tracking-wider text-slate-500 mb-1">AI Analysis</div>
            <div class="text-xs text-slate-300 leading-relaxed bg-white/3 rounded-lg p-2">${inc.ai}</div>
            <div class="flex items-center gap-2 mt-2">
              <span class="w-1.5 h-1.5 rounded-full ${inc.status==='investigating'?'bg-amber':inc.status==='responding'?'bg-green':inc.status==='resolved'?'bg-slate-400':'bg-cyan'}"></span>
              <span class="text-[11px] ${statusColors[inc.status] || 'text-cyan'} capitalize">${inc.status}</span>
            </div>
          </div>`;
        }).join('');
      }
    });
  }

  // Initial render and dynamic update hook
  renderIncidents();
  window.addEventListener('incidentsUpdated', renderIncidents);

  // Security AI Recommendations
  const secRecs = document.getElementById('security-recommendations');
  if (secRecs) {
    runWithBoundary('Security AI Recommendations', 'security-recommendations', () => {
      secRecs.innerHTML = `
        <div class="p-2 rounded-lg mb-2" style="background:rgba(255,56,96,0.06);border:1px solid rgba(255,56,96,0.15)"><span class="text-red text-[10px] font-semibold uppercase">Priority 1:</span> Dispatch team to Section 204 for baggage inspection. Estimated arrival: 2 min.</div>
        <div class="p-2 rounded-lg mb-2" style="background:rgba(255,184,0,0.06);border:1px solid rgba(255,184,0,0.15)"><span class="text-amber text-[10px] font-semibold uppercase">Priority 2:</span> Open Gate C overflow to relieve Gate A pressure. Deploy 4 volunteers.</div>
        <div class="p-2 rounded-lg" style="background:rgba(0,240,255,0.06);border:1px solid rgba(0,240,255,0.1)"><span class="text-cyan text-[10px] font-semibold uppercase">Advisory:</span> North perimeter sensor recalibrated. False positive rate reduced by 15%.</div>
      `;
    });
  }

  // Medical Incident Feed
  const medFeed = document.getElementById('medical-feed');
  if (medFeed) {
    runWithBoundary('Medical Incident Feed', 'medical-feed', () => {
      const medicalIncidents = stateManager.get('medicalIncidents') || [];
      medFeed.innerHTML = medicalIncidents.map(m => {
        const sevColors = { critical: 'badge-critical', moderate: 'badge-warning', low: 'badge-info' };
        const statusColors = { responding: 'text-green', resolved: 'text-slate-400' };
        return `<div class="glass p-4 mb-3">
          <div class="flex items-center justify-between mb-2">
            <div class="flex items-center gap-2"><span class="badge ${sevColors[m.severity]}">${m.severity}</span><span class="text-xs font-semibold text-white">${m.type}</span></div>
            <span class="text-[10px] ${statusColors[m.status]} capitalize">${m.status}</span>
          </div>
          <div class="text-xs text-slate-400 mb-1"><i class="fa-solid fa-location-dot text-green mr-1"></i>${m.location}</div>
          <div class="text-xs text-slate-400 mb-1"><i class="fa-solid fa-user-nurse text-cyan mr-1"></i>${m.team}</div>
          <div class="text-xs text-slate-400"><i class="fa-solid fa-route text-amber mr-1"></i>${m.route}</div>
          <div class="flex items-center gap-2 mt-2"><span class="text-[10px] text-slate-500">Response:</span><span class="font-display text-sm text-white">${m.responseTime}</span></div>
        </div>`;
      }).join('');
    });
  }

  // Simulation Scenario cards
  const scenariosContainer = document.getElementById('scenario-cards');
  if (scenariosContainer) {
    runWithBoundary('Simulation Scenarios', 'scenario-cards', () => {
      const scenarios = stateManager.get('scenarios') || [];
      scenariosContainer.innerHTML = scenarios.map(s => {
        const riskColors = { MEDIUM: 'badge-warning', HIGH: 'badge-critical', CRITICAL: 'badge-critical' };
        return `<div class="glass scenario-card p-4" data-scenario="${s.id}">
          <div class="flex items-center justify-between mb-3"><i class="fa-solid ${s.icon} text-lg text-cyan"></i><span class="badge ${riskColors[s.risk]}">${s.risk}</span></div>
          <div class="text-sm font-semibold text-white mb-1">${s.name}</div>
          <div class="text-[11px] text-slate-500 mb-3">${s.desc}</div>
          <div class="flex items-center justify-between"><span class="text-[10px] text-slate-500">Impact Score</span><span class="font-display text-sm text-amber">${s.impact}/100</span></div>
        </div>`;
      }).join('');

      scenariosContainer.querySelectorAll('.scenario-card').forEach(card => {
        card.addEventListener('click', () => {
          scenariosContainer.querySelectorAll('.scenario-card').forEach(c => c.classList.remove('active'));
          card.classList.add('active');
          runSimulation(card.dataset.scenario);
        });
      });
    });
  }

  let simChartInstance = null;
  function runSimulation(id) {
    runWithBoundary('Simulation Engine Runner', 'simulation-results', () => {
      const results = stateManager.get('scenarioResults') || {};
      const data = results[id];
      if (!data) return;
      document.getElementById('simulation-results').style.display = 'grid';
      document.getElementById('sim-result-title').textContent = data.title;
      document.getElementById('sim-impact-score').textContent = data.impact;
      document.getElementById('sim-impact-detail').textContent = data.detail;
      document.getElementById('sim-mitigation').innerHTML = data.mitigation.map((m, i) =>
        `<div class="flex gap-2 p-2 rounded-lg bg-white/3"><span class="text-cyan font-display text-[10px] mt-0.5">${String(i + 1).padStart(2, '0')}</span><span>${m}</span></div>`
      ).join('');

      // Inject custom scenario incident to feed (demonstrates concurrent multi-incidents)
      injectMultiIncidentFromSimulation(id, data);

      const ctx = document.getElementById('chart-simulation');
      if (ctx) {
        if (simChartInstance) simChartInstance.destroy();
        simChartInstance = new Chart(ctx, {
          type: 'radar',
          data: { labels: data.labels, datasets: [{ data: data.data, borderColor: '#00f0ff', backgroundColor: 'rgba(0,240,255,0.1)', pointBackgroundColor: '#00f0ff', pointRadius: 4, borderWidth: 2 }] },
          options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { r: { grid: { color: 'rgba(255,255,255,0.05)' }, angleLines: { color: 'rgba(255,255,255,0.05)' }, ticks: { display: false }, pointLabels: { color: '#94a3b8', font: { size: 9, family: 'Space Grotesk' } }, min: 0, max: 100 } } }
        });
      }
    });
  }

  /**
   * Schedules a new incident dynamically into the state lists.
   */
  function injectMultiIncidentFromSimulation(scenarioId, scenarioDetails) {
    const incidents = stateManager.get('incidents') || [];
    
    // Prevent duplicate injections
    const exists = incidents.some(i => i.id === `sim_${scenarioId}`);
    if (exists) {
      showToast('Scenario active. Timeline schedule running.', 'info');
      return;
    }

    const newIncident = {
      id: `sim_${scenarioId}`,
      type: `Simulation: ${scenarioDetails.title}`,
      location: 'Stadium Concourse N',
      confidence: 0.95,
      status: 'responding',
      severity: scenarioDetails.impact.toLowerCase() === 'critical' ? 'critical' : 'warning',
      time: 'Just now',
      timer: 30, // 30 seconds resolution timer
      ai: `Mitigation: ${scenarioDetails.mitigation[0]}. Timeline resolution scheduled.`
    };

    incidents.unshift(newIncident);
    stateManager.set('incidents', incidents);
    renderIncidents();
    showToast(`Concurrent scenario incident loaded: ID ${newIncident.id}`, 'warning');
  }

  /* ============================
     CONCURRENT INCIDENT SCHEDULER
     ============================ */
  setInterval(() => {
    runWithBoundary('Multi-incident Timeline Scheduler', 'incident-feed', () => {
      let incidents = stateManager.get('incidents') || [];
      let updated = false;

      incidents = incidents.map(inc => {
        if (inc.status !== 'resolved' && inc.timer !== undefined) {
          updated = true;
          if (inc.timer > 0) {
            return { ...inc, timer: inc.timer - 5 };
          } else {
            showToast(`Incident Resolved: ${inc.type}`, 'success');
            return { ...inc, status: 'resolved', timer: 0 };
          }
        }
        return inc;
      });

      if (updated) {
        stateManager.set('incidents', incidents);
        renderIncidents();
      }
    });
  }, 5000);

  // Fan Chat logic
  const messagesContainer = document.getElementById('chat-messages');
  const chatInput = document.getElementById('chat-input');
  const chatSend = document.getElementById('chat-send');

  if (messagesContainer) {
    runWithBoundary('Chat History Loader', 'chat-messages', () => {
      const history = stateManager.get('chatHistory') || [];
      if (history.length > 0) {
        history.forEach(msg => {
          addChatMessage(msg.type, msg.text, false);
        });
      } else {
        addChatMessage('ai', 'Welcome to ArenaOne! I\'m your AI assistant for tonight\'s match. I can help you with directions, food, transport, accessibility, parking, and more. What do you need?', true);
      }
    });
  }

  if (chatSend && chatInput) {
    chatSend.addEventListener('click', sendChatMessage);
    chatInput.addEventListener('keydown', e => { if (e.key === 'Enter') sendChatMessage(); });
  }

  function addChatMessage(type, text, save = true) {
    const div = document.createElement('div');
    div.className = `flex ${type === 'user' ? 'justify-end' : 'justify-start'}`;
    div.innerHTML = `<div class="chat-bubble ${type === 'user' ? 'chat-user' : 'chat-ai'}">${text}</div>`;
    messagesContainer.appendChild(div);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    
    if (save) {
      const history = stateManager.get('chatHistory') || [];
      history.push({ type, text });
      stateManager.set('chatHistory', history);
      stateManager.saveAsync();
    }
  }

  function generateAIResponse(userInput) {
    const lower = userInput.toLowerCase();
    const kpis = stateManager.get('kpis') || {};
    const occupancy = Math.round(kpis.occupancy || 87);
    const density = Math.round(kpis.density || 73);
    const incidents = stateManager.get('incidents') || [];
    const activeIncidentsCount = incidents.filter(i => i.status !== 'resolved').length;
    const alerts = stateManager.get('alerts') || [];
    
    let baseResponse = "";
    
    if (lower.includes('direction') || lower.includes('where') || lower.includes('seat') || lower.includes('find')) {
      baseResponse = `To reach your seat, go through Gate B, take the first right on the concourse, then follow the blue signs to Section 115. It's approximately a 4-minute walk. Note: Current stadium occupancy is at ${occupancy}%, so some walkways are busy.`;
      if (lower.includes('wheelchair') || lower.includes('access')) {
        baseResponse += " For wheelchair-accessible routes, please use Elevator C as Elevator B is undergoing maintenance.";
      }
    } else if (lower.includes('food') || lower.includes('eat') || lower.includes('hungry') || lower.includes('queue') || lower.includes('stall')) {
      baseResponse = `The shortest queue right now is at Stall F5 (2 min wait) — they have burgers, pizza, and drinks. Stall F3 has the shortest walk from your section but a 8-min queue.`;
      if (density > 75) {
        baseResponse += ` Due to high crowd density (${density}%), stall queues may increase shortly. We recommend visiting Stall F5 now.`;
      }
    } else if (lower.includes('transport') || lower.includes('metro') || lower.includes('bus') || lower.includes('leave') || lower.includes('exit') || lower.includes('home')) {
      baseResponse = `After the match, the fastest exit is Gate E. The metro has an 8 min wait time, with buses departing every 6 min from Lot B.`;
      const metroAlert = alerts.find(a => a.text.toLowerCase().includes('metro') || a.text.toLowerCase().includes('transport'));
      if (metroAlert) {
        baseResponse += ` WARNING: We are tracking a transit notice: "${metroAlert.text}". Consider ride-share at Lot B instead.`;
      }
    } else if (lower.includes('access') || lower.includes('wheelchair') || lower.includes('elevator') || lower.includes('restroom') || lower.includes('disabled')) {
      baseResponse = `The nearest accessible restroom is 20m to your left on the concourse. Elevator C is fully operational for upper deck access.`;
      const elevatorAlert = alerts.find(a => a.text.toLowerCase().includes('elevator'));
      if (elevatorAlert) {
        baseResponse += ` Note: ${elevatorAlert.text}. Wheelchair routes have been automatically updated.`;
      }
    } else if (lower.includes('park') || lower.includes('car') || lower.includes('drive')) {
      baseResponse = `You are currently parked in Lot C, Row 14. After the match, exit via the north gate to avoid Route 3 traffic. Estimated drive-out time: 15 minutes.`;
    } else if (lower.includes('status') || lower.includes('incident') || lower.includes('security') || lower.includes('alert')) {
      baseResponse = `We are currently monitoring ${activeIncidentsCount} active operational alerts. Stadium health is at ${kpis.health ? kpis.health.toFixed(0) : 94}%. All emergency response systems are fully operational.`;
      if (activeIncidentsCount > 0) {
        const primary = incidents.find(i => i.status !== 'resolved');
        if (primary) {
          baseResponse += ` Primary active security tracking: ${primary.type} at ${primary.location} (Severity: ${primary.severity}).`;
        }
      }
    } else {
      baseResponse = `I can help you with directions, food, transport options, accessibility support, and parking updates. (Current occupancy: ${occupancy}%, active alerts: ${activeIncidentsCount}). What can I assist you with?`;
    }
    
    return baseResponse;
  }

  function sendChatMessage() {
    const text = chatInput.value.trim();
    if (!text) return;
    addChatMessage('user', text, true);
    chatInput.value = '';

    setTimeout(() => {
      runWithBoundary('Chat Response Generator', 'chat-messages', () => {
        const response = generateAIResponse(text);
        addChatMessage('ai', response, true);
      });
    }, 600 + Math.random() * 400);
  }
});
