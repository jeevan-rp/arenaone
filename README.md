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

* **[index.html](file:///d:/arenaone/index.html)**: The semantic HTML5 layout structuring the grid viewport, sidebar menus, and operational panels.
* **[style.css](file:///d:/arenaone/style.css)**: Sleek, high-performance styling using a cyberpunk glassmorphism theme, dynamic keyframe animations, and WCAG contrast enhancements.
* **[js/app.js](file:///d:/arenaone/js/app.js)**: Holds global data states, real-time KPI loops, toast notifications, and sidebar view routing.
* **[js/main.js](file:///d:/arenaone/js/main.js)**: Manages incident rendering feed, simulation scenario triggers, and the Fan AI chatbot logic.
* **[js/twin.js](file:///d:/arenaone/js/twin.js)**: Configures the **Three.js WebGL** stadium render, particle-simulation crowd waves, and active incident coordinates.
* **[js/charts.js](file:///d:/arenaone/js/charts.js)**: Handles the **Chart.js** instances (bar, line, doughnut) for electricity, medical response, parking fill rates, and food queues.
* **[js/voice.js](file:///d:/arenaone/js/voice.js)**: Implements browser-level speech recognition, matching audio patterns to automated command actions.

---

## 🔒 Security & Code Quality Standards

* **Zero Inline Scripts**: All logic is fully extracted into external scripts under the `js/` directory. This allows the application to adhere to a strict **Content Security Policy (CSP)**.
* **Secure Web APIs**: Utilizes secure browser Web Speech APIs that process voice inputs locally, keeping operations data private.
* **Memory Optimization**: Cleans up previous charts and simulations when toggling views to prevent memory leaks.
* **DOM Safety**: Utilizes `document.createDocumentFragment()` and `replaceChildren()` to minimize layout thrashing.

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
1. Open **[tests.html](file:///d:/arenaone/tests.html)** in any web browser.
2. The browser loads the Mocha & Chai environment to run unit checks on:
   - State initialization (occupancy, density, incidents)
   - View navigation routing & ARIA-selected toggling
   - Toast warning creation
   - Natural language voice parsing rules
   - Simulation mitigation outputs
   - Accessibility announcer updates
