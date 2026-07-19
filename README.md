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

---

## 🔒 Security & Code Quality Standards

* **Strict Content Security Policy (CSP)**: Zero inline scripts anywhere in the application. All logic is strictly encapsulated in external ES modules under the `js/` directory. No `'unsafe-inline'` script-src permitted. `connect-src` explicitly allows `https://generativelanguage.googleapis.com` for Gemini API calls.
* **AES-GCM-256 Encrypted State**: All persisted state is encrypted at rest using the Web Crypto API with PBKDF2 key derivation (10,000 iterations, random salt) and a session-scoped passphrase.
* **XSS-Safe DOM Rendering**: Dynamic content strictly uses `createElement` + `textContent` / `replaceChildren` — zero `innerHTML` string interpolation with user-controlled data anywhere in the codebase.
* **OAuth 2.0 PKCE with CSRF Protection**: Authorization flow validates state parameter matches session token; invalid state parameters halt authentication immediately and display security alert toasts.
* **Secure Web APIs**: Voice recognition runs locally via the Web Speech API — no audio data leaves the browser.
* **Explicit Resource Cleanup**: Chart instances are explicitly destroyed via `destroyChart()` before recreation; WebGL canvas elements feature automated context loss and recovery event listeners.
* **Centralised Constants Module**: All operational parameters are centralised in `js/constants.js` with full JSDoc annotations — zero magic numbers in business logic.

---

## ♿ Accessibility Compliance (WCAG 2.1 AAA)

- **Contrast-Enhanced Color System**: Dark theme text elements maintain contrast ratios strictly above 4.5:1 (Slate-500) and 7:1 (Slate-600).
- **Comprehensive Keyboard Navigation**: Sidebar tabs, scenario cards, language selectors, and 3D layer buttons are focusable (`tabindex="0"`) with `Enter` and `Space` keyboard handlers.
- **Screen Reader Announcements**: An ARIA Live assertive announcer (`#sr-announcer`) broadcasts critical warnings, errors, and system alerts. Dynamic data panels use `aria-live="polite"`.
- **Skip Links & Main Focus Trap**: Accessible *"Skip to Content"* link focuses the `<main id="main-content" tabindex="-1">` container cleanly.
- **Modal Dialog ARIA Standards**: Login and voice overlays feature `role="dialog"`, `aria-modal="true"`, and keyboard focus trapping.
- **Animation Safety**: Uses `prefers-reduced-motion` media queries to disable non-essential translations and scan-lines for vestibular safety.

---

## 🌍 Multilingual Speech & Language Support

Supports **8 operational languages** across voice recognition and Fan AI Companion:
1. **English (en-US)** — Base operations & speech command parsing
2. **Spanish (es-ES)** — Multitud, seguridad, emergencias, transporte
3. **Portuguese (pt-PT)** — Multidão, segurança, emergência, transporte
4. **French (fr-FR)** — Foule, sécurité, urgence, transport
5. **German (de-DE)** — Menge, sicherheit, notfall, transport
6. **Arabic (ar-SA)** — حشد, أمن, طوارئ, نقل
7. **Chinese (zh-CN)** — 人群, 安保, 紧急, 交通
8. **Japanese (ja-JP)** — 群集, セキュリティ, 救急, 交通

---

## 🧪 Verification & Testing

Verify system functionality using the automated QA test suite:
1. Open **[tests.html](tests.html)** in any web browser.
2. The browser loads the Mocha & Chai environment to run **18 automated unit and integration tests**:
   1. AES-GCM-256 state encryption & decryption round-trip
   2. OAuth 2.0 role permission checks & session token refresh
   3. OAuth CSRF state mismatch rejection & security alert logging
   4. Telemetry service mock responses & exponential backoff retries on HTTP 500
   5. Permanent HTTP 404 telemetry detection & offline simulation fallback
   6. WebGL canvas dimensions & graphics context lost/restored recovery
   7. View navigation routing & ARIA-selected toggling
   8. Toast warning creation & SR announcer updates (`#sr-announcer`)
   9. 8-language localized voice dictionary command parsing (EN, ES, PT, FR, DE, AR, ZH, JA)
   10. Voice command execution & live view routing
   11. Deterministic scenario simulation repeatability & impact radar chart scoring
   12. Chart.js isolated canvas initialization & `destroyChart()` memory cleanup
   13. Context-aware AI chatbot responses & XSS script injection prevention
   14. Interactive AI command execution (intent extraction to app view switching)
   15. Volunteer recommendation algorithm scaling based on crowd density thresholds
   16. Scenario mitigation plan injection & multi-incident scheduler
   17. Focus trapping & keyboard accessibility compliance (`Enter` / `Space`)
   18. Strict Content Security Policy compliance (no `'unsafe-inline'` script-src, valid `connect-src`)
3. **CI/CD**: Tests run automatically on every push via **[GitHub Actions](.github/workflows/ci.yml)** using headless Playwright Chromium.

---

## 🧩 Challenge Alignment

This solution directly maps to each evaluation criterion:

| Criterion | Implementation |
|---|---|
| **Smart, dynamic assistant** | Three-tier AI: Chrome Gemini Nano (on-device) → Gemini API → context-aware dynamic fallback using live KPI state. Interactive AI command execution turns user prompts into live stadium UI actions automatically. |
| **Logical decision making** | Volunteer count derived from real-time density (`VOLUNTEER_DENSITY_SCALE`); incident confidence scores oscillate per tick; telemetry auto-falls back to simulation on API 404. |
| **Practical & real-world usability** | Covers 8 FIFA 2026 operational domains at MetLife Stadium; accessibility supports 8 languages; all actions reflect real stadium workflow. |
| **Clean & maintainable code** | 12 focused ES modules; `js/constants.js` centralises all parameters; JSDoc on all exports; `runWithBoundary()` error safety everywhere; zero dynamic `innerHTML` string interpolation. |

---

## 📝 Assumptions

The following assumptions were made during design and implementation:

1. **No live backend available**: The solution operates in a browser-only, offline-first mode. The `TelemetryService` polls a `/api/v1/telemetry` endpoint and gracefully falls back to a deterministic mathematical simulation when the endpoint returns 404 (always, in demo mode). A real deployment would point this to a live IoT data aggregation API.

2. **Gemini API key is user-supplied**: The fan chatbot's Gemini API integration requires the operator to paste their own Gemini API key into the Settings panel. It is stored in `sessionStorage` only (not persisted to disk). In production, this would be replaced with a server-side proxy.

3. **Chrome/Edge assumed for on-device AI**: The `window.ai` (Gemini Nano) integration is available only in Chrome Canary with the Prompt API flag enabled. The application detects availability at runtime and falls back silently.

4. **Auth is simulated**: The OAuth 2.0 PKCE flow uses mock tokens and a URL-parameter redirect to simulate a real IdP without requiring a backend. In production, this would integrate with an identity provider such as Google Workspace or Okta.

5. **Stadium data is representative, not live**: All KPIs, incident records, zone densities, and chart data are seeded from realistic MetLife Stadium operational parameters for the FIFA World Cup 2026 final match day, but are not sourced from a real-time stadium management system.

6. **Single-page, desktop-first**: The command center dashboard is designed for stadium operations staff on desktop or large-screen displays. Responsive breakpoints at 1024px and 768px provide usability on tablets; mobile layout is intentionally simplified.

