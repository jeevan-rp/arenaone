/**
 * @fileoverview Application-wide named constants for ArenaOne AI Command Center.
 *
 * Centralising magic numbers here improves readability, reduces duplication,
 * and makes tuning operational parameters a single-file change.
 * Import individual constants by name — tree-shaking will drop unused ones.
 */

// --- Loading Screen ----------------------------------------------------------

/** Interval between each loading animation step, in milliseconds. */
export const LOADING_STEP_MS = 100;

/** Delay before the loading screen fades out after animation completes, in ms. */
export const LOADING_HIDE_DELAY_MS = 300;

// --- Toast Notifications -----------------------------------------------------

/** Duration a toast notification stays visible before being auto-removed, in ms. */
export const TOAST_DURATION_MS = 4000;

// --- Periodic Tasks ----------------------------------------------------------

/** How often the alert-dispatch simulation injects a new alert entry, in ms. */
export const ALERT_DISPATCH_INTERVAL_MS = 15000;

/** How often the concurrent incident scheduler ticks countdown timers, in ms. */
export const INCIDENT_TICK_INTERVAL_MS = 5000;

/** Seconds deducted from an incident countdown timer on each scheduler tick. */
export const INCIDENT_TIMER_DECREMENT_S = 5;

// --- Chat / AI ---------------------------------------------------------------

/** Base delay in ms before a chat AI response appears (simulates thinking). */
export const CHAT_RESPONSE_BASE_DELAY_MS = 600;

/** Additional random jitter range added to the base chat response delay, in ms. */
export const CHAT_RESPONSE_JITTER_MS = 400;

// --- State & Storage ---------------------------------------------------------

/** Milliseconds before persisted localStorage state is considered stale (2 hours). */
export const STATE_EXPIRATION_MS = 2 * 60 * 60 * 1000;

/** PBKDF2 iteration count used during AES-GCM-256 key derivation. */
export const PBKDF2_ITERATIONS = 10000;

/** Maximum number of alerts retained in the rolling alert history. */
export const MAX_ALERT_HISTORY = 10;

// --- Crowd Simulation (Deterministic Model) ----------------------------------

/** Base stadium occupancy percentage for the deterministic simulation model. */
export const SIM_BASE_OCCUPANCY = 87;

/** Peak-to-peak amplitude of the occupancy sine wave, in percentage points. */
export const SIM_OCCUPANCY_AMPLITUDE = 1.5;

/** Base crowd density percentage for the simulation model. */
export const SIM_BASE_DENSITY = 73;

/** Peak-to-peak amplitude of the density cosine wave, in percentage points. */
export const SIM_DENSITY_AMPLITUDE = 3;

/** Base stadium health index for the simulation model. */
export const SIM_BASE_HEALTH = 94;

/** Peak-to-peak amplitude of the health sine wave, in index points. */
export const SIM_HEALTH_AMPLITUDE = 0.8;

// --- Volunteer Dispatch Model ------------------------------------------------

/** Density level (%) above which the volunteer recommendation formula activates. */
export const VOLUNTEER_DENSITY_THRESHOLD = 50;

/** Scaling factor converting excess density points into a volunteer head-count. */
export const VOLUNTEER_DENSITY_SCALE = 1.8;

/** Minimum recommended volunteer deployment regardless of density. */
export const VOLUNTEER_MIN_COUNT = 10;

// --- WebGL / Three.js Rendering ----------------------------------------------

/** Maximum device pixel ratio clamped for WebGL renderers (avoids GPU overload). */
export const WEBGL_MAX_PIXEL_RATIO = 2;

/** Number of crowd particles rendered in the command-view 3D scene. */
export const WEBGL_CROWD_COUNT = 6000;

/** Number of crowd particles rendered in the full digital-twin scene. */
export const WEBGL_FULL_CROWD_COUNT = 10000;

/** Delay in ms before the command-view 3D scene is initialised on startup. */
export const WEBGL_INIT_DELAY_MS = 2500;

/** Retry delay in ms when the Three.js container has not yet been sized by layout. */
export const WEBGL_RESIZE_RETRY_MS = 200;
