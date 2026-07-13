import { stateManager } from './state.js';
import { showToast } from './app.js';

/* ============================
   VOICE COMMAND ENGINE
   ============================ */

const voiceBtn = document.getElementById('voice-btn');
const voiceOverlay = document.getElementById('voice-overlay');
const voiceTranscript = document.getElementById('voice-transcript');
const voiceCloseBtn = document.getElementById('voice-close-btn');
let recognition = null;
let lastActiveElement = null;
let currentLocale = 'en-US';

// Localized Speech dictionaries
const COMMAND_DICTIONARIES = {
  'en-US': {
    'command': 'command', 'center': 'command', 'overview': 'command',
    'crowd': 'crowd', 'density': 'crowd',
    'security': 'security', 'incident': 'security',
    'emergency': 'emergency', 'medical': 'emergency',
    'transport': 'transport', 'parking': 'transport',
    'vendor': 'vendor', 'food': 'vendor',
    'sustainability': 'sustainability', 'energy': 'sustainability',
    'simulation': 'simulation', 'scenario': 'simulation',
    'fan': 'fan', 'chat': 'fan',
    'twin': 'digital-twin', '3d': 'digital-twin',
    'accessibility': 'accessibility',
    'tournament': 'tournament', 'staff': 'tournament',
  },
  'es-ES': {
    'comando': 'command', 'centro': 'command',
    'multitud': 'crowd', 'densidad': 'crowd',
    'seguridad': 'security', 'incidente': 'security',
    'emergencia': 'emergency', 'médico': 'emergency',
    'transporte': 'transport', 'estacionamiento': 'transport',
    'proveedor': 'vendor', 'comida': 'vendor',
    'sostenibilidad': 'sustainability', 'energía': 'sustainability',
    'simulación': 'simulation', 'escenario': 'simulation',
    'aficionado': 'fan', 'chat': 'fan',
    'gemelo': 'digital-twin', '3d': 'digital-twin',
    'accesibilidad': 'accessibility',
    'torneo': 'tournament', 'personal': 'tournament',
  },
  'pt-PT': {
    'comando': 'command', 'centro': 'command',
    'multidão': 'crowd', 'densidade': 'crowd',
    'segurança': 'security', 'incidente': 'security',
    'emergência': 'emergency', 'médico': 'emergency',
    'transporte': 'transport', 'estacionamento': 'transport',
    'fornecedor': 'vendor', 'comida': 'vendor',
    'sustentabilidade': 'sustainability', 'energia': 'sustainability',
    'simulação': 'simulation', 'cenário': 'simulation',
    'fã': 'fan', 'chat': 'fan',
    'gêmeo': 'digital-twin', '3d': 'digital-twin',
    'acessibilidade': 'accessibility',
    'torneio': 'tournament', 'equipe': 'tournament',
  },
  'fr-FR': {
    'commande': 'command', 'centre': 'command',
    'foule': 'crowd', 'densité': 'crowd',
    'sécurité': 'security', 'incident': 'security',
    'urgence': 'emergency', 'médical': 'emergency',
    'transport': 'transport', 'parking': 'transport',
    'vendeur': 'vendor', 'nourriture': 'vendor',
    'durabilité': 'sustainability', 'énergie': 'sustainability',
    'simulation': 'simulation', 'scénario': 'simulation',
    'supporter': 'fan', 'chat': 'fan',
    'jumeau': 'digital-twin', '3d': 'digital-twin',
    'accessibilité': 'accessibility',
    'tournoi': 'tournament', 'personnel': 'tournament',
  }
};

function initRecognition() {
  if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = currentLocale;

    recognition.onresult = (e) => {
      const transcript = Array.from(e.results).map(r => r[0].transcript).join('');
      if (voiceTranscript) voiceTranscript.textContent = transcript || 'Listening...';
      if (e.results[0].isFinal) processVoiceCommand(transcript.toLowerCase());
    };

    recognition.onend = () => {
      setTimeout(() => {
        closeVoiceOverlay();
      }, 1000);
    };

    recognition.onerror = () => {
      closeVoiceOverlay();
      showToast('Voice recognition error. Try again.', 'error');
    };
  }
}

function openVoiceOverlay() {
  lastActiveElement = document.activeElement;
  if (voiceOverlay) {
    voiceOverlay.classList.add('active');
    if (voiceTranscript) voiceTranscript.textContent = 'Listening...';
    if (voiceCloseBtn) voiceCloseBtn.focus();
  }
  
  if (!recognition) initRecognition();
  
  try {
    if (recognition) recognition.start();
  } catch(e) {
    if (recognition) {
      recognition.stop();
      setTimeout(() => recognition.start(), 200);
    }
  }
}

function closeVoiceOverlay() {
  if (voiceOverlay) {
    voiceOverlay.classList.remove('active');
  }
  try {
    if (recognition) recognition.stop();
  } catch(err) {}
  if (lastActiveElement) {
    lastActiveElement.focus();
  }
}

if (voiceBtn) {
  voiceBtn.addEventListener('click', () => {
    openVoiceOverlay();
  });
}

if (voiceCloseBtn) {
  voiceCloseBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    closeVoiceOverlay();
  });
}

if (voiceOverlay) {
  voiceOverlay.addEventListener('click', (e) => {
    if (e.target === voiceOverlay) {
      closeVoiceOverlay();
    }
  });
}

document.addEventListener('keydown', (e) => {
  if (voiceOverlay && voiceOverlay.classList.contains('active')) {
    if (e.key === 'Escape') {
      closeVoiceOverlay();
    }
    if (e.key === 'Tab') {
      const focusables = voiceOverlay.querySelectorAll('button, [tabindex="0"]');
      if (focusables.length > 0) {
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey) {
          if (document.activeElement === first) {
            last.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === last) {
            first.focus();
            e.preventDefault();
          }
        }
      }
    }
  }
});

// Dynamic language selection binding
const langBtns = document.querySelectorAll('.lang-btn');
langBtns.forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    langBtns.forEach(b => {
      b.className = 'lang-btn text-[9px] px-2 py-0.5 rounded bg-white/5 text-slate-400';
    });
    btn.className = 'lang-btn text-[9px] px-2 py-0.5 rounded bg-cyan/10 text-cyan border border-cyan/20';
    
    const lang = btn.dataset.lang;
    currentLocale = lang;
    if (recognition) {
      recognition.lang = lang;
    } else {
      initRecognition();
    }
    showToast(`Voice input language set to: ${lang}`, 'success');
  });
});

/**
 * Parses a textual command transcript and routes to view controllers or fires action toasts.
 * @param {string} cmd The normalized lowercase voice command transcript.
 * @returns {void}
 */
export function processVoiceCommand(cmd) {
  closeVoiceOverlay();
  
  // Retrieve dictionary based on active locale, falling back to English
  const dictionary = COMMAND_DICTIONARIES[currentLocale] || COMMAND_DICTIONARIES['en-US'];
  
  let matched = false;
  for (const [keyword, view] of Object.entries(dictionary)) {
    if (cmd.includes(keyword)) {
      if (window.navigateToView) {
        window.navigateToView(view);
        showToast(`Navigated to ${view.replace('-',' ')}`, 'success');
        matched = true;
      }
      break;
    }
  }

  // Cross-lingual semantic fallbacks
  if (cmd.includes('congested') || cmd.includes('congestion') || cmd.includes('congestión') || cmd.includes('congestão')) {
    showToast('Gate A is most congested at 89% density. Recommend Gate C overflow.', 'warning');
    matched = true;
  }
  if (cmd.includes('volunteer') || cmd.includes('deploy') || cmd.includes('voluntario') || cmd.includes('voluntário')) {
    showToast('Volunteers deployed to Gate A — 4 agents en route.', 'success');
    matched = true;
  }
  if (cmd.includes('summary') || cmd.includes('status') || cmd.includes('resumen') || cmd.includes('resumo')) {
    showToast('AI Summary: 87% occupancy, 3 incidents, LOW risk. All systems nominal.', 'info');
    matched = true;
  }
  if (!matched) {
    showToast(`Command not recognized: "${cmd}"`, 'warning');
  }
}

// Initial setup
initRecognition();
window.processVoiceCommand = processVoiceCommand;
