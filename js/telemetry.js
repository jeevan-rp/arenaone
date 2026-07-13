/**
 * Reusable Telemetry Service with polling, exponential backoff retries, and timeout configurations.
 */
export class TelemetryService {
  /**
   * @param {Object} options
   * @param {string} options.endpoint REST API URL.
   * @param {number} [options.pollingInterval=3000] Polling interval in ms.
   * @param {number} [options.timeoutMs=5000] Request timeout limit in ms.
   * @param {number} [options.maxRetries=3] Maximum number of retry attempts.
   * @param {number} [options.initialRetryDelay=1000] Initial retry delay in ms.
   * @param {function(Object)} options.onData Callback invoked on successful data load.
   * @param {function(Error)} [options.onError] Callback invoked on telemetry errors.
   * @param {function(boolean)} [options.onLoading] Callback invoked with loading status changes.
   */
  constructor(options) {
    this.endpoint = options.endpoint;
    this.pollingInterval = options.pollingInterval || 3000;
    this.timeoutMs = options.timeoutMs || 5000;
    this.maxRetries = options.maxRetries || 3;
    this.initialRetryDelay = options.initialRetryDelay || 1000;
    
    this.onData = options.onData;
    this.onError = options.onError || (() => {});
    this.onLoading = options.onLoading || (() => {});

    this.timerId = null;
    this.isPolling = false;
  }

  /**
   * Starts the polling cycle.
   */
  start() {
    if (this.isPolling) return;
    this.isPolling = true;
    this._poll();
  }

  /**
   * Stops the polling cycle.
   */
  stop() {
    this.isPolling = false;
    if (this.timerId) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
  }

  /**
   * Internal poll dispatcher.
   * @private
   */
  async _poll() {
    if (!this.isPolling) return;
    this.onLoading(true);
    
    try {
      const data = await this._fetchWithRetry(this.endpoint, 0);
      this.onData(data);
      this.onLoading(false);
    } catch (err) {
      console.error('[TelemetryService] Polling cycle error:', err);
      this.onError(err);
      this.onLoading(false);
    }

    if (this.isPolling) {
      this.timerId = setTimeout(() => this._poll(), this.pollingInterval);
    }
  }

  /**
   * Fetches endpoint with timeout and exponential backoff retry.
   * @private
   */
  async _fetchWithRetry(url, attempt = 0) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(id);

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return await response.json();
    } catch (err) {
      clearTimeout(id);
      
      if (attempt < this.maxRetries && this.isPolling) {
        const delay = this.initialRetryDelay * Math.pow(2, attempt);
        console.warn(`[TelemetryService] Fetch failed. Retrying in ${delay}ms... (Attempt ${attempt + 1}/${this.maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
        return this._fetchWithRetry(url, attempt + 1);
      }
      throw err;
    }
  }
}
