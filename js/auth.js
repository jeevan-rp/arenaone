/**
 * OAuth 2.0 PKCE / OpenID Connect Authentication Coordinator for ArenaOne.
 */
export class AuthService {
  constructor() {
    this.sessionTokenKey = 'arenaone_auth_token';
    this.userKey = 'arenaone_auth_user';
    this.tokenRefreshInterval = 5 * 60 * 1000; // 5 minutes
    this.refreshTimer = null;
  }

  /**
   * Initializes the session checking.
   */
  init() {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('code')) {
      const code = urlParams.get('code');
      const state = urlParams.get('state');
      this._handleCallback(code, state);
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    if (this.isAuthenticated()) {
      this._startTokenRefreshTimer();
    }
  }

  /**
   * Simulates OAuth PKCE Redirect login.
   * @param {string} role User role ('Operator' | 'Supervisor' | 'Administrator')
   */
  login(role = 'Operator') {
    const state = Math.random().toString(36).substring(2);
    const codeChallenge = Math.random().toString(36).substring(2);
    
    sessionStorage.setItem('oauth_state', state);
    sessionStorage.setItem('oauth_code_verifier', codeChallenge);

    const redirectUrl = `${window.location.origin}${window.location.pathname}?code=mock_code_for_${role}&state=${state}`;
    window.location.href = redirectUrl;
  }

  /**
   * Logs the user out.
   */
  logout() {
    sessionStorage.removeItem(this.sessionTokenKey);
    sessionStorage.removeItem(this.userKey);
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
      this.refreshTimer = null;
    }
    window.location.reload();
  }

  /**
   * Processes the authentication code callback.
   * @private
   */
  _handleCallback(code, state) {
    const savedState = sessionStorage.getItem('oauth_state');
    if (savedState && savedState !== state) {
      console.error('[AuthService] Invalid state mismatch detected!');
      return;
    }

    const match = code.match(/mock_code_for_(Operator|Supervisor|Administrator)/);
    const role = match ? match[1] : 'Operator';

    const token = {
      accessToken: `mock_jwt_access_token_${Math.random().toString(36).substring(2)}`,
      refreshToken: `mock_jwt_refresh_token_${Math.random().toString(36).substring(2)}`,
      expiresAt: Date.now() + 15 * 60 * 1000
    };

    const user = {
      username: `${role.toLowerCase()}_user`,
      role: role
    };

    sessionStorage.setItem(this.sessionTokenKey, JSON.stringify(token));
    sessionStorage.setItem(this.userKey, JSON.stringify(user));
    this._startTokenRefreshTimer();
  }

  /**
   * Checks if user has a valid access token.
   * @returns {boolean}
   */
  isAuthenticated() {
    const token = this.getToken();
    if (!token) return false;
    return Date.now() < token.expiresAt;
  }

  /**
   * Retrieves the access token structure.
   */
  getToken() {
    try {
      const stored = sessionStorage.getItem(this.sessionTokenKey);
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      return null;
    }
  }

  /**
   * Retrieves current logged in user details.
   * @returns {Object|null}
   */
  getUser() {
    try {
      const stored = sessionStorage.getItem(this.userKey);
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      return null;
    }
  }

  /**
   * Checks if active role can perform supervisor operations.
   */
  hasRole(requiredRoles) {
    const user = this.getUser();
    if (!user) return false;
    return requiredRoles.includes(user.role);
  }

  /**
   * Simulates OAuth Token Refresh.
   */
  refreshSessionToken() {
    const token = this.getToken();
    if (!token) return;

    console.log('[AuthService] Refreshing access token...');
    token.accessToken = `mock_jwt_access_token_refreshed_${Math.random().toString(36).substring(2)}`;
    token.expiresAt = Date.now() + 15 * 60 * 1000;
    sessionStorage.setItem(this.sessionTokenKey, JSON.stringify(token));
  }

  /**
   * Starts periodic token refresh ticks.
   * @private
   */
  _startTokenRefreshTimer() {
    if (this.refreshTimer) clearInterval(this.refreshTimer);
    this.refreshTimer = setInterval(() => {
      this.refreshSessionToken();
    }, this.tokenRefreshInterval);
  }
}

export const authService = new AuthService();
window.authService = authService;
authService.init();

// Handle DOM UI integrations securely without inline scripts to comply with CSP
document.addEventListener('DOMContentLoaded', () => {
  const overlay = document.getElementById('login-overlay');
  const logoutBtn = document.getElementById('logout-btn');
  const userRoleDisplay = document.getElementById('user-role-display');
  
  if (authService.isAuthenticated()) {
    if (overlay) overlay.style.display = 'none';
    const user = authService.getUser();
    if (userRoleDisplay && user) {
      userRoleDisplay.innerHTML = `<span class="text-cyan font-medium">${user.username}</span> (${user.role})`;
    }
  } else {
    if (overlay) overlay.style.display = 'flex';
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => authService.logout());
  }

  // Set click handlers for login button redirects
  document.querySelectorAll('.oauth-login-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const role = btn.dataset.role;
      authService.login(role);
    });
  });
});
