import { stateManager } from './state.js';
import { showToast, runWithBoundary } from './app.js';

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
    typingDiv.innerHTML = `<div class="chat-bubble chat-ai text-slate-500 italic">Thinking...</div>`;
    messagesContainer.appendChild(typingDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    setTimeout(async () => {
      runWithBoundary('Chat Response Generator', 'chat-messages', async () => {
        typingDiv.remove();
        const response = await generateAIResponse(text);
        addChatMessage('ai', response, true);
      });
    }, 600 + Math.random() * 400);
  }
});

export async function generateAIResponse(userInput) {
  const lower = userInput.toLowerCase();
  const kpis = stateManager.get('kpis') || {};
  const occupancy = Math.round(kpis.occupancy || 87);
  const density = Math.round(kpis.density || 73);
  const incidents = stateManager.get('incidents') || [];
  const activeIncidentsCount = incidents.filter(i => i.status !== 'resolved').length;
  const alerts = stateManager.get('alerts') || [];

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
  const calculatedVolunteers = Math.max(10, Math.round((density - 50) * 1.8));

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

