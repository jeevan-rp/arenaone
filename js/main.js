import { stateManager } from './state.js';
import { showToast, runWithBoundary } from './app.js';
import {
  INCIDENT_TICK_INTERVAL_MS,
  INCIDENT_TIMER_DECREMENT_S,
  CHAT_RESPONSE_BASE_DELAY_MS,
  CHAT_RESPONSE_JITTER_MS,
  VOLUNTEER_MIN_COUNT,
  VOLUNTEER_DENSITY_THRESHOLD,
  VOLUNTEER_DENSITY_SCALE,
} from './constants.js';

document.addEventListener('DOMContentLoaded', () => {
  // Security Incident Feed rendering function (supports multiple concurrent incidents)
  function renderIncidents() {
    runWithBoundary('Security Incident Feed', 'incident-feed', () => {
      const incidentFeed = document.getElementById('incident-feed');
      if (!incidentFeed) return;

      const incidents = stateManager.get('incidents') || [];
      const sevColors = { critical: 'badge-critical', warning: 'badge-warning', moderate: 'badge-warning', low: 'badge-info' };
      const statusColors = { investigating: 'text-amber', monitoring: 'text-cyan', responding: 'text-green', resolved: 'text-slate-400' };

      const fragment = document.createDocumentFragment();

      incidents.forEach(inc => {
        // Card wrapper
        const card = document.createElement('div');
        card.className = 'glass p-4 alert-item mb-3';

        // --- Header row ---
        const header = document.createElement('div');
        header.className = 'flex items-center justify-between mb-2';

        const headerLeft = document.createElement('div');
        headerLeft.className = 'flex items-center gap-2';

        const sevBadge = document.createElement('span');
        sevBadge.className = `badge ${sevColors[inc.severity] || 'badge-info'}`;
        sevBadge.textContent = inc.severity;                    // Safe: textContent

        const typeSpan = document.createElement('span');
        typeSpan.className = 'text-xs font-semibold text-white';
        typeSpan.textContent = inc.type;                        // Safe: textContent

        headerLeft.appendChild(sevBadge);
        headerLeft.appendChild(typeSpan);

        const timeSpan = document.createElement('span');
        timeSpan.className = 'text-[10px] text-slate-600';
        timeSpan.textContent = inc.time;                        // Safe: textContent

        header.appendChild(headerLeft);
        header.appendChild(timeSpan);

        // --- Location row ---
        const locationRow = document.createElement('div');
        locationRow.className = 'text-xs text-slate-400 mb-2';

        const locationIcon = document.createElement('i');
        locationIcon.className = 'fa-solid fa-location-dot text-cyan mr-1';
        locationIcon.setAttribute('aria-hidden', 'true');

        const locationText = document.createTextNode(inc.location); // Safe
        locationRow.appendChild(locationIcon);
        locationRow.appendChild(locationText);

        // Timer pill (conditional)
        if (inc.status !== 'resolved' && inc.timer !== undefined) {
          const timerSpan = document.createElement('span');
          timerSpan.className = 'text-[10px] text-amber ml-2';

          const clockIcon = document.createElement('i');
          clockIcon.className = 'fa-regular fa-clock mr-0.5';
          clockIcon.setAttribute('aria-hidden', 'true');

          timerSpan.appendChild(clockIcon);
          timerSpan.appendChild(document.createTextNode(`Resolving in ${inc.timer}s`)); // Safe
          locationRow.appendChild(timerSpan);
        }

        // --- Confidence bar row ---
        const confRow = document.createElement('div');
        confRow.className = 'flex items-center gap-2 mb-2';

        const confLabel = document.createElement('span');
        confLabel.className = 'text-[10px] text-slate-500';
        confLabel.textContent = 'Confidence:';

        const confBarWrap = document.createElement('div');
        confBarWrap.className = 'confidence-bar flex-1';

        const confFill = document.createElement('div');
        confFill.className = 'confidence-fill';
        confFill.style.width = `${(inc.confidence * 100).toFixed(0)}%`;
        confFill.style.background = inc.confidence > 0.85 ? 'var(--red)' : inc.confidence > 0.7 ? 'var(--amber)' : 'var(--cyan)';
        confBarWrap.appendChild(confFill);

        const confPct = document.createElement('span');
        confPct.className = 'text-[10px] text-white font-semibold';
        confPct.textContent = `${(inc.confidence * 100).toFixed(0)}%`; // Safe

        confRow.appendChild(confLabel);
        confRow.appendChild(confBarWrap);
        confRow.appendChild(confPct);

        // --- AI Analysis ---
        const aiLabel = document.createElement('div');
        aiLabel.className = 'text-[10px] uppercase tracking-wider text-slate-500 mb-1';
        aiLabel.textContent = 'AI Analysis';

        const aiText = document.createElement('div');
        aiText.className = 'text-xs text-slate-300 leading-relaxed bg-white/3 rounded-lg p-2';
        aiText.textContent = inc.ai;                            // Safe: textContent

        // --- Status row ---
        const statusRow = document.createElement('div');
        statusRow.className = 'flex items-center gap-2 mt-2';

        const dot = document.createElement('span');
        dot.className = `w-1.5 h-1.5 rounded-full ${
          inc.status === 'investigating' ? 'bg-amber' :
          inc.status === 'responding'    ? 'bg-green' :
          inc.status === 'resolved'      ? 'bg-slate-400' : 'bg-cyan'
        }`;

        const statusText = document.createElement('span');
        statusText.className = `text-[11px] ${statusColors[inc.status] || 'text-cyan'} capitalize`;
        statusText.textContent = inc.status;                    // Safe: textContent

        statusRow.appendChild(dot);
        statusRow.appendChild(statusText);

        // Assemble card
        card.appendChild(header);
        card.appendChild(locationRow);
        card.appendChild(confRow);
        card.appendChild(aiLabel);
        card.appendChild(aiText);
        card.appendChild(statusRow);
        fragment.appendChild(card);
      });

      incidentFeed.replaceChildren(fragment);
    });
  }

  // Initial render and dynamic update hook
  renderIncidents();
  window.addEventListener('incidentsUpdated', renderIncidents);

  // Security AI Recommendations
  const secRecs = document.getElementById('security-recommendations');
  if (secRecs) {
    runWithBoundary('Security AI Recommendations', 'security-recommendations', () => {
      const recs = [
        { type: 'Priority 1:', text: 'Dispatch team to Section 204 for baggage inspection. Estimated arrival: 2 min.', color: 'text-red', bg: 'rgba(255,56,96,0.06)', border: 'rgba(255,56,96,0.15)' },
        { type: 'Priority 2:', text: 'Open Gate C overflow to relieve Gate A pressure. Deploy 4 volunteers.', color: 'text-amber', bg: 'rgba(255,184,0,0.06)', border: 'rgba(255,184,0,0.15)' },
        { type: 'Advisory:', text: 'North perimeter sensor recalibrated. False positive rate reduced by 15%.', color: 'text-cyan', bg: 'rgba(0,240,255,0.06)', border: 'rgba(0,240,255,0.1)' }
      ];

      const fragment = document.createDocumentFragment();
      recs.forEach(r => {
        const item = document.createElement('div');
        item.className = 'p-2 rounded-lg mb-2 text-xs text-slate-300 leading-relaxed';
        item.style.background = r.bg;
        item.style.border = `1px solid ${r.border}`;

        const badge = document.createElement('span');
        badge.className = `${r.color} text-[10px] font-semibold uppercase mr-1`;
        badge.textContent = r.type;

        const text = document.createTextNode(r.text);

        item.appendChild(badge);
        item.appendChild(text);
        fragment.appendChild(item);
      });
      secRecs.replaceChildren(fragment);
    });
  }

  // Medical Incident Feed
  const medFeed = document.getElementById('medical-feed');
  if (medFeed) {
    runWithBoundary('Medical Incident Feed', 'medical-feed', () => {
      const medicalIncidents = stateManager.get('medicalIncidents') || [];
      const sevColors = { critical: 'badge-critical', moderate: 'badge-warning', low: 'badge-info' };
      const statusColors = { responding: 'text-green', resolved: 'text-slate-400' };

      const fragment = document.createDocumentFragment();
      medicalIncidents.forEach(m => {
        const card = document.createElement('div');
        card.className = 'glass p-4 mb-3';

        // Header
        const header = document.createElement('div');
        header.className = 'flex items-center justify-between mb-2';

        const headerLeft = document.createElement('div');
        headerLeft.className = 'flex items-center gap-2';

        const badge = document.createElement('span');
        badge.className = `badge ${sevColors[m.severity] || 'badge-info'}`;
        badge.textContent = m.severity;

        const typeSpan = document.createElement('span');
        typeSpan.className = 'text-xs font-semibold text-white';
        typeSpan.textContent = m.type;

        headerLeft.appendChild(badge);
        headerLeft.appendChild(typeSpan);

        const statusSpan = document.createElement('span');
        statusSpan.className = `text-[10px] ${statusColors[m.status] || 'text-cyan'} capitalize`;
        statusSpan.textContent = m.status;

        header.appendChild(headerLeft);
        header.appendChild(statusSpan);

        // Location
        const locRow = document.createElement('div');
        locRow.className = 'text-xs text-slate-400 mb-1';
        const locIcon = document.createElement('i');
        locIcon.className = 'fa-solid fa-location-dot text-green mr-1';
        locIcon.setAttribute('aria-hidden', 'true');
        locRow.appendChild(locIcon);
        locRow.appendChild(document.createTextNode(m.location));

        // Team
        const teamRow = document.createElement('div');
        teamRow.className = 'text-xs text-slate-400 mb-1';
        const teamIcon = document.createElement('i');
        teamIcon.className = 'fa-solid fa-user-nurse text-cyan mr-1';
        teamIcon.setAttribute('aria-hidden', 'true');
        teamRow.appendChild(teamIcon);
        teamRow.appendChild(document.createTextNode(m.team));

        // Route
        const routeRow = document.createElement('div');
        routeRow.className = 'text-xs text-slate-400';
        const routeIcon = document.createElement('i');
        routeIcon.className = 'fa-solid fa-route text-amber mr-1';
        routeIcon.setAttribute('aria-hidden', 'true');
        routeRow.appendChild(routeIcon);
        routeRow.appendChild(document.createTextNode(m.route));

        // Response time
        const timeRow = document.createElement('div');
        timeRow.className = 'flex items-center gap-2 mt-2';
        const timeLbl = document.createElement('span');
        timeLbl.className = 'text-[10px] text-slate-500';
        timeLbl.textContent = 'Response:';
        const timeVal = document.createElement('span');
        timeVal.className = 'font-display text-sm text-white';
        timeVal.textContent = m.responseTime;
        timeRow.appendChild(timeLbl);
        timeRow.appendChild(timeVal);

        card.appendChild(header);
        card.appendChild(locRow);
        card.appendChild(teamRow);
        card.appendChild(routeRow);
        card.appendChild(timeRow);
        fragment.appendChild(card);
      });
      medFeed.replaceChildren(fragment);
    });
  }

  // Simulation Scenario cards
  const scenariosContainer = document.getElementById('scenario-cards');
  if (scenariosContainer) {
    runWithBoundary('Simulation Scenarios', 'scenario-cards', () => {
      const scenarios = stateManager.get('scenarios') || [];
      const riskColors = { MEDIUM: 'badge-warning', HIGH: 'badge-critical', CRITICAL: 'badge-critical' };

      const fragment = document.createDocumentFragment();
      scenarios.forEach(s => {
        const card = document.createElement('div');
        card.className = 'glass scenario-card p-4';
        card.dataset.scenario = s.id;
        card.setAttribute('tabindex', '0');
        card.setAttribute('role', 'button');
        card.setAttribute('aria-label', `Scenario: ${s.name}, Risk: ${s.risk}, Impact: ${s.impact}`);

        // Top row
        const topRow = document.createElement('div');
        topRow.className = 'flex items-center justify-between mb-3';
        const icon = document.createElement('i');
        icon.className = `fa-solid ${s.icon} text-lg text-cyan`;
        icon.setAttribute('aria-hidden', 'true');
        const badge = document.createElement('span');
        badge.className = `badge ${riskColors[s.risk] || 'badge-info'}`;
        badge.textContent = s.risk;
        topRow.appendChild(icon);
        topRow.appendChild(badge);

        // Name & desc
        const nameDiv = document.createElement('div');
        nameDiv.className = 'text-sm font-semibold text-white mb-1';
        nameDiv.textContent = s.name;

        const descDiv = document.createElement('div');
        descDiv.className = 'text-[11px] text-slate-500 mb-3';
        descDiv.textContent = s.desc;

        // Bottom row
        const btmRow = document.createElement('div');
        btmRow.className = 'flex items-center justify-between';
        const lblSpan = document.createElement('span');
        lblSpan.className = 'text-[10px] text-slate-500';
        lblSpan.textContent = 'Impact Score';
        const valSpan = document.createElement('span');
        valSpan.className = 'font-display text-sm text-amber';
        valSpan.textContent = `${s.impact}/100`;
        btmRow.appendChild(lblSpan);
        btmRow.appendChild(valSpan);

        card.appendChild(topRow);
        card.appendChild(nameDiv);
        card.appendChild(descDiv);
        card.appendChild(btmRow);

        card.addEventListener('click', () => {
          scenariosContainer.querySelectorAll('.scenario-card').forEach(c => c.classList.remove('active'));
          card.classList.add('active');
          runSimulation(card.dataset.scenario);
        });

        card.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            scenariosContainer.querySelectorAll('.scenario-card').forEach(c => c.classList.remove('active'));
            card.classList.add('active');
            runSimulation(card.dataset.scenario);
          }
        });

        fragment.appendChild(card);
      });
      scenariosContainer.replaceChildren(fragment);
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

      const mitContainer = document.getElementById('sim-mitigation');
      if (mitContainer) {
        const frag = document.createDocumentFragment();
        data.mitigation.forEach((m, i) => {
          const item = document.createElement('div');
          item.className = 'flex gap-2 p-2 rounded-lg bg-white/3 text-xs text-slate-300';
          const num = document.createElement('span');
          num.className = 'text-cyan font-display text-[10px] mt-0.5';
          num.textContent = String(i + 1).padStart(2, '0');
          const txt = document.createElement('span');
          txt.textContent = m;
          item.appendChild(num);
          item.appendChild(txt);
          frag.appendChild(item);
        });
        mitContainer.replaceChildren(frag);
      }

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
            return { ...inc, timer: inc.timer - INCIDENT_TIMER_DECREMENT_S };
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
  }, INCIDENT_TICK_INTERVAL_MS);

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

  // Setup API key listener if input exists
  const geminiInput = document.getElementById('gemini-key-input');
  if (geminiInput) {
    // Use sessionStorage so the API key is never persisted to disk between sessions
    geminiInput.value = sessionStorage.getItem('arenaone_gemini_api_key') || '';
    geminiInput.addEventListener('change', () => {
      sessionStorage.setItem('arenaone_gemini_api_key', geminiInput.value.trim());
      showToast('Gemini API key updated successfully.', 'success');
    });
  }

  function addChatMessage(type, text, save = true) {
    const div = document.createElement('div');
    div.className = `flex ${type === 'user' ? 'justify-end' : 'justify-start'}`;
    
    const bubble = document.createElement('div');
    bubble.className = `chat-bubble ${type === 'user' ? 'chat-user' : 'chat-ai'}`;
    bubble.textContent = text; // Safe text assignment to prevent XSS
    div.appendChild(bubble);
    
    messagesContainer.appendChild(div);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    
    if (save) {
      const history = stateManager.get('chatHistory') || [];
      history.push({ type, text });
      stateManager.set('chatHistory', history);
      stateManager.saveAsync();
    }
  }

  function sendChatMessage() {
    const text = chatInput.value.trim();
    if (!text) return;
    addChatMessage('user', text, true);
    chatInput.value = '';

    const typingDiv = document.createElement('div');
    typingDiv.className = 'flex justify-start';
    
    const typingBubble = document.createElement('div');
    typingBubble.className = 'chat-bubble chat-ai text-slate-500 italic';
    typingBubble.textContent = 'Thinking...';
    typingDiv.appendChild(typingBubble);

    messagesContainer.appendChild(typingDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    setTimeout(async () => {
      runWithBoundary('Chat Response Generator', 'chat-messages', async () => {
        typingDiv.remove();
        const response = await generateAIResponse(text);
        addChatMessage('ai', response, true);
      });
    }, CHAT_RESPONSE_BASE_DELAY_MS + Math.random() * CHAT_RESPONSE_JITTER_MS);
  }
});

/**
 * Generates context-aware GenAI responses for the Fan Assistant / Security Copilot.
 * Integrates interactive app command execution (view navigation, volunteer dispatch)
 * alongside Chrome Gemini Nano (on-device Prompt API), Gemini API, or context-aware fallback.
 * @param {string} userInput - Raw query typed or spoken by user.
 * @returns {Promise<string>} The generated assistant response.
 */
export async function generateAIResponse(userInput) {
  const lower = userInput.toLowerCase();
  const kpis = stateManager.get('kpis') || {};
  const occupancy = Math.round(kpis.occupancy || 87);
  const density = Math.round(kpis.density || 73);
  const incidents = stateManager.get('incidents') || [];
  const activeIncidentsCount = incidents.filter(i => i.status !== 'resolved').length;
  const alerts = stateManager.get('alerts') || [];

  const calculatedVolunteers = Math.max(
    VOLUNTEER_MIN_COUNT,
    Math.round((density - VOLUNTEER_DENSITY_THRESHOLD) * VOLUNTEER_DENSITY_SCALE)
  );

  // Interactive Command Execution: Execute live app actions when requested by user in chat
  if (lower.includes('show twin') || lower.includes('3d twin') || lower.includes('digital twin') || lower.includes('show 3d')) {
    if (window.navigateToView) window.navigateToView('digital-twin');
    showToast('AI Command Executed: Switched to 3D Digital Twin View', 'success');
  } else if (lower.includes('show security') || lower.includes('security copilot') || lower.includes('threat level')) {
    if (window.navigateToView) window.navigateToView('security');
    showToast('AI Command Executed: Switched to Security Copilot', 'info');
  } else if (lower.includes('show crowd') || lower.includes('crowd density') || lower.includes('heatmap')) {
    if (window.navigateToView) window.navigateToView('crowd');
    showToast('AI Command Executed: Switched to Crowd Intelligence', 'info');
  } else if (lower.includes('show emergency') || lower.includes('medical response')) {
    if (window.navigateToView) window.navigateToView('emergency');
    showToast('AI Command Executed: Switched to Emergency Response', 'info');
  } else if (lower.includes('show transport') || lower.includes('parking fill')) {
    if (window.navigateToView) window.navigateToView('transport');
    showToast('AI Command Executed: Switched to Transport Intel', 'info');
  } else if (lower.includes('deploy volunteer') || lower.includes('send volunteer') || lower.includes('deploy staff')) {
    showToast(`AI Command Executed: Deployed ${calculatedVolunteers} auxiliary volunteers to Gate A concourse.`, 'success');
  }

  const systemPrompt = `You are ArenaOne AI, the smart command center assistant for the FIFA World Cup 2026 at MetLife Stadium.
Current Stadium Status:
- Occupancy: ${occupancy}%
- Crowd Density: ${density}%
- Active Alerts/Incidents: ${activeIncidentsCount}
- Active notifications: ${alerts.map(a => a.text).join('; ')}

User Query: "${userInput}"

Provide a brief, context-aware, helpful response (max 3 sentences) for the fans or operations team. Make it highly relevant to their query and the stadium context.`;

  // 1. Try window.ai (Chrome Gemini Nano on-device AI)
  try {
    if (typeof window.ai !== 'undefined' && (window.ai.assistant || window.ai.languageModel)) {
      const capabilities = await (window.ai.assistant ? window.ai.assistant.capabilities() : window.ai.languageModel.capabilities());
      if (capabilities.available !== 'no') {
        const session = await (window.ai.assistant ? window.ai.assistant.create() : window.ai.languageModel.create());
        const aiResponse = await session.prompt(systemPrompt);
        if (aiResponse && aiResponse.trim().length > 0) {
          return aiResponse.trim();
        }
      }
    }
  } catch (e) {
    console.warn('[ArenaOne AI] Local window.ai failed or not initialized:', e);
  }

  // 2. Try Gemini API if key is present (key stored in sessionStorage for security)
  const geminiKey = sessionStorage.getItem('arenaone_gemini_api_key');
  if (geminiKey) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: systemPrompt }] }]
        })
      });
      if (res.ok) {
        const json = await res.json();
        const textResponse = json.candidates?.[0]?.content?.parts?.[0]?.text;
        if (textResponse) return textResponse.trim();
      }
    } catch (err) {
      console.error('[ArenaOne AI] Gemini API key call failed:', err);
    }
  }

  // 3. Fallback: Context-Aware Dynamic Responses with variations
  const prompts = {
    directions: [
      `To reach your seat, go through Gate B, take the first right on the concourse, then follow the blue signs to Section 115. With the stadium at ${occupancy}% occupancy, expect some queue flow, but signs are clearly posted.`,
      `Section 115 is best reached via the Gate B corridors. Use the blue wayfinding signs; our volunteers along the route are ready to guide you.`
    ],
    accessibility: [
      `The nearest wheelchair-accessible restroom is located 20 meters to your left. Please utilize Elevator C for upper deck access as Elevator B is currently shut down for servicing.`,
      `For accessible routes to the upper level, head toward Elevator C. Staff members near Section 104 can assist with priority boarding.`
    ],
    food: [
      `Stall F5 has the shortest queue (approx 2 min wait). Stall F3 is closer but currently has an 8-minute line due to high zone density (${density}%).`,
      `We recommend visiting Stall F5 for pizza and burgers to avoid the crowd. Walkways near Gate A are currently busy.`
    ],
    transport: [
      `The fastest route home is through Gate E to the metro shuttle loop (8 min wait). Buses are departing Lot B every 6 minutes.`,
      `Metro operations are steady with minor delays. Transit shuttles at Lot B offer active departures every 6 minutes.`
    ],
    status: [
      `MetLife Stadium is operating at ${occupancy}% capacity with ${activeIncidentsCount} active operational alerts under watch. All security teams are deployed.`,
      `Operations are stable. System health is normal with active crowd heatmaps monitored by the Security Copilot.`
    ],
    volunteers: [
      `Currently, crowd density stands at ${density}%. Based on standard flow rate patterns, we recommend deploying a minimum of ${calculatedVolunteers} volunteers to support gate operations.`,
      `We recommend placing ${calculatedVolunteers} auxiliary volunteers near Gate A and Section 101 to optimize concourse crowd movement.`
    ]
  };

  const getRandomElement = arr => arr[Math.floor(Math.random() * arr.length)];

  if (lower.includes('direction') || lower.includes('where') || lower.includes('seat') || lower.includes('find')) {
    if (lower.includes('wheelchair') || lower.includes('access')) {
      return getRandomElement(prompts.accessibility);
    }
    return getRandomElement(prompts.directions);
  } else if (lower.includes('food') || lower.includes('eat') || lower.includes('hungry') || lower.includes('queue') || lower.includes('stall')) {
    return getRandomElement(prompts.food);
  } else if (lower.includes('transport') || lower.includes('metro') || lower.includes('bus') || lower.includes('leave') || lower.includes('exit') || lower.includes('home')) {
    return getRandomElement(prompts.transport);
  } else if (lower.includes('access') || lower.includes('wheelchair') || lower.includes('elevator') || lower.includes('restroom') || lower.includes('disabled')) {
    return getRandomElement(prompts.accessibility);
  } else if (lower.includes('status') || lower.includes('incident') || lower.includes('security') || lower.includes('alert')) {
    return getRandomElement(prompts.status);
  } else if (lower.includes('volunteer') || lower.includes('staff') || lower.includes('deploy') || lower.includes('people')) {
    return getRandomElement(prompts.volunteers);
  }

  return `Hello! I'm the ArenaOne AI Copilot for FIFA 2026. I can assist with directions, accessible routes (e.g., Elevator C), transport, and food wait times. Current stadium occupancy is ${occupancy}%.`;
}


