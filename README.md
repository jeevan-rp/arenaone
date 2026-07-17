# 🏟️ ArenaOne — AI Command Center | FIFA World Cup 2026

ArenaOne is a state-of-the-art, Generative AI-enabled smart stadium operations command center and 3D digital twin dashboard designed for the **FIFA World Cup 2026** at MetLife Stadium (hosting the final match). It integrates crowd intelligence, security automation, transport logistics, accessibility services, and real-time tournament operations support.

---

## 🏆 Project Vertical
**Smart Stadiums & Tournament Operations**
*Build a GenAI-enabled solution that enhances stadium operations and the overall tournament experience for fans, organizers, volunteers, or venue staff.*

---

## 🚀 Key GenAI & Smart Capabilities

### 1. 👮 Security Copilot
- **Threat Detection**: Automatically evaluates incidents (e.g., unattended baggage, fence alarms, crowd surges) and outputs confidence scores.
- **AI Recommendation Engine**: Recommends mitigation protocols, dispatching security, and routing volunteers immediately.

### 2. 🦽 Accessibility AI
- **Multilingual Support**: Supports 8+ languages (English, Spanish, Portuguese, French, German, Arabic, Chinese, Japanese) for universal accessibility.
- **Automatic Rerouting**: Instantly detects facility faults (e.g., elevator out of service) and reroutes wheelchair users to working elevators.
- **Visual & Hearing Assistance**: Audio descriptions, caption loops, and vibration-mode alerts for emergency broadcast delivery.

### 3. 👥 Crowd Intelligence & Heatmaps
- **Real-Time Density Map**: Built-in HTML5 Canvas heatmap rendering zones ranging from Gate A to VIP sections.
- **Flow Control Predictions**: Predicts gate congestion and queue wait times, recommending sign overrides and overflow redirection.

### 4. 🌀 AI Simulation Engine
- Runs what-if scenarios (e.g., *Halftime Rain*, *Metro Outage*, *Partial Power Failure*, *Full Stadium Evacuation*) with radar charts representing impact scores across multiple parameters.

### 5. 🎤 Voice Command Engine
- Local, private natural speech recognition allowing stadium directors to navigate sections, deploy volunteers, or review warnings by saying keywords like *"Show me the 3D twin"*, *"Deploy volunteers"*, or *"Check congestion"*.

---

## 📂 System Architecture & Modules

The application is structured cleanly into modular vanilla JavaScript files to maintain readability, efficiency, and a robust security posture:

* **[index.html](index.html)**: The semantic HTML5 layout structuring the grid viewport, sidebar menus, and operational panels.
* **[style.css](style.css)**: Sleek, high-performance styling using a cyberpunk glassmorphism theme, dynamic keyframe animations, and WCAG contrast enhancements.
* **[js/constants.js](js/constants.js)**: Centralised named constants (timing intervals, simulation parameters, WebGL settings, volunteer thresholds) — single source of truth for all tunable values.
* **[js/config.js](js/config.js)**: Default application state including initial KPIs, incident data, scenario definitions, and simulation result templates.
* **[js/state.js](js/state.js)**: AES-GCM-256 encrypted, async state manager with pub/sub listeners, session-scoped key derivation, and 2-hour expiry.
* **[js/app.js](js/app.js)**: Global KPI loops, toast notification system, sidebar navigation, and the `runWithBoundary()` error boundary utility.
* **[js/main.js](js/main.js)**: Incident rendering feed, simulation scenario triggers, concurrent incident scheduler, and the Fan AI chatbot logic.
* **[js/twin.js](js/twin.js)**: Configures the **Three.js WebGL** stadium render, GPU ShaderMaterial crowd particles, context-loss recovery, and dynamic color uniforms.
* **[js/charts.js](js/charts.js)**: Handles the **Chart.js** instances (bar, line, doughnut) for electricity, medical response, parking fill rates, and food queues.
* **[js/voice.js](js/voice.js)**: Multilingual speech recognition (EN/ES/PT/FR) matching audio patterns to automated navigation and action commands.
* **[js/auth.js](js/auth.js)**: Simulated OAuth 2.0 PKCE flow with state-parameter CSRF validation, role-based access, and session token refresh.
* **[js/telemetry.js](js/telemetry.js)**: Reusable polling service with `AbortController` timeout, exponential backoff retry, and permanent-404 fallback mode.

---

## 🔒 Security & Code Quality Standards

* **Zero Inline Scripts**: All logic is fully extracted into external ES modules under the `js/` directory, enabling a strict **Content Security Policy (CSP)**.
* **AES-GCM-256 Encrypted State**: All persisted state is encrypted at rest using the Web Crypto API with PBKDF2 key derivation (10,000 iterations, random salt) and a session-scoped passphrase.
* **XSS-Safe DOM Rendering**: All dynamic content uses `createElement` + `textContent` — no `innerHTML` with user-controlled data anywhere in the codebase.
* **Secure Web APIs**: Voice recognition runs locally via the Web Speech API — no audio data leaves the browser.
* **Memory Optimization**: Chart instances are explicitly destroyed before recreation; WebGL canvas elements are removed on context loss.
* **Named Constants Module**: All operational parameters are centralised in `js/constants.js` — no magic numbers in business logic.

---

## ♿ Accessibility Compliance (WCAG 2.1)

- **Contrast-Enhanced Color System**: Dark theme text elements are adjusted to maintain contrast ratios above 4.5:1 (Slate-500) and 7:1 (Slate-600).
- **Keyboard Friendly Navigation**: Sidebar tabs are focusable (`tabindex="0"`) and support navigation using both `Space` and `Enter` keys.
- **Screen Reader Announcements**: An ARIA Live assertive announcer (`#sr-announcer`) broadcasts critical warnings, errors, and system alerts.
- **Skip Links**: Accessible *"Skip to Content"* skip link is present on page load.
- **Animation Safety**: Uses `prefers-reduced-motion` media queries to disable non-essential translations and scan-lines for vestibular safety.

---

## 🧪 Verification & Testing

Verify system functionality using the automated QA test suite:
1. Open **[tests.html](tests.html)** in any web browser.
2. The browser loads the Mocha & Chai environment to run unit checks on:
   - AES-GCM-256 state encryption & decryption round-trip
   - OAuth 2.0 role permission checks
   - Telemetry service mock responses & exponential backoff retries
   - State initialization (occupancy, density, incidents)
   - View navigation routing & ARIA-selected toggling
   - Toast warning creation & SR announcer updates
   - Natural language voice parsing & multilingual routing
   - Deterministic simulation repeatability
   - Chart.js isolated canvas initialization
   - Context-aware AI chatbot responses & XSS prevention
3. **CI/CD**: Tests run automatically on every push via **[GitHub Actions](.github/workflows/ci.yml)** using headless Playwright Chromium.

---

## 🧩 Challenge Alignment

This solution directly maps to each evaluation criterion:

| Criterion | Implementation |
|---|---|
| **Smart, dynamic assistant** | Three-tier AI: Chrome Gemini Nano (on-device) → Gemini API → context-aware dynamic fallback using live KPI state |
| **Logical decision making** | Volunteer count derived from real-time density; incident confidence scores oscillate per tick; telemetry auto-falls back to simulation on API failure |
| **Practical & real-world usability** | Covers 8 FIFA 2026 operational domains at MetLife Stadium; accessibility supports 8+ languages; all actions reflect real stadium workflow |
| **Clean & maintainable code** | 12 focused ES modules; `js/constants.js` centralises all parameters; JSDoc on all exports; `runWithBoundary()` error safety everywhere |

---

## 📝 Assumptions

The following assumptions were made during design and implementation:

1. **No live backend available**: The solution operates in a browser-only, offline-first mode. The `TelemetryService` polls a `/api/v1/telemetry` endpoint and gracefully falls back to a deterministic mathematical simulation when the endpoint returns 404 (always, in demo mode). A real deployment would point this to a live IoT data aggregation API.

2. **Gemini API key is user-supplied**: The fan chatbot's Gemini API integration requires the operator to paste their own Gemini API key into the Settings panel. It is stored in `sessionStorage` only (not persisted to disk). In production, this would be replaced with a server-side proxy.

3. **Chrome/Edge assumed for on-device AI**: The `window.ai` (Gemini Nano) integration is available only in Chrome Canary with the Prompt API flag enabled. The application detects availability at runtime and falls back silently.

4. **Auth is simulated**: The OAuth 2.0 PKCE flow uses mock tokens and a URL-parameter redirect to simulate a real IdP without requiring a backend. In production, this would integrate with an identity provider such as Google Workspace or Okta.

5. **Stadium data is representative, not live**: All KPIs, incident records, zone densities, and chart data are seeded from realistic MetLife Stadium operational parameters for the FIFA World Cup 2026 final match day, but are not sourced from a real-time stadium management system.

6. **Single-page, desktop-first**: The command center dashboard is designed for stadium operations staff on desktop or large-screen displays. Responsive breakpoints at 1024px and 768px provide usability on tablets; mobile layout is intentionally simplified.
