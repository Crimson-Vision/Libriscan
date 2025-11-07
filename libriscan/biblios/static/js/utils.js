/**
 * Libriscan JavaScript Utilities
 */

const LibriscanUtils = {
  /**
   * Get a cookie value by name
   * @param {string} name - Cookie name
   * @returns {string|null} Cookie value or null if not found
   */
  getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
      const cookies = document.cookie.split(';');
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        if (cookie.substring(0, name.length + 1) === (name + '=')) {
          cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
          break;
        }
      }
    }
    return cookieValue;
  },

  /**
   * Get CSRF token from various sources
   * @returns {string|null} CSRF token
   */
  getCSRFToken() {
    const htmxHeaders = document.body.getAttribute('hx-headers');
    if (htmxHeaders) {
      try {
        const headers = JSON.parse(htmxHeaders);
        if (headers['x-csrftoken']) {
          return headers['x-csrftoken'];
        }
      } catch (error) {
        console.warn('Failed to parse HTMX headers');
      }
    }
    
    // Fallback to other methods
    return document.querySelector('[name=csrfmiddlewaretoken]')?.value || 
           document.querySelector('meta[name=csrf-token]')?.getAttribute('content') ||
           this.getCookie('csrftoken');
  },

  /**
   * Make an authenticated HTTP request with CSRF token
   * @param {string} url - Request URL
   * @param {Object} options - Request options
   * @param {string} options.method - HTTP method (default: 'POST')
   * @param {Object} options.headers - Additional headers
   * @param {string} options.body - Request body
   * @param {boolean} options.includeCSRF - Whether to include CSRF token (default: true)
   * @returns {Promise<Response>} Fetch response
   */
  async makeAuthenticatedRequest(url, options = {}) {
    const {
      method = 'POST',
      headers = {},
      body = '',
      includeCSRF = true
    } = options;

    const requestHeaders = {
      'Content-Type': 'application/x-www-form-urlencoded',
      ...headers
    };

    if (includeCSRF) {
      const csrfToken = this.getCSRFToken();
      if (csrfToken) {
        requestHeaders['X-CSRFToken'] = csrfToken;
      }
    }

    const response = await fetch(url, {
      method,
      headers: requestHeaders,
      body
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Request failed with status ${response.status}`);
    }

    return response;
  },

  /**
   * Parse Libriscan URL pattern to extract components
   * @param {string} pathname - URL pathname (default: current location)
   * @returns {Object} Parsed URL components
   */
  parseLibriscanURL(pathname = window.location.pathname) {
    const urlParts = pathname.match(/\/([^\/]+)\/([^\/]+)\/([^\/]+)\/page(\d+)\//);
    
    if (!urlParts) {
      throw new Error('Could not parse Libriscan URL pattern');
    }
    
    const [, shortName, collectionSlug, identifier, pageNumber] = urlParts;
    
    return {
      shortName,
      collectionSlug,
      identifier,
      pageNumber: parseInt(pageNumber, 10),
      basePath: `/${shortName}/${collectionSlug}/${identifier}`
    };
  },

  /**
   * Build a word update URL for the current page
   * @param {number} wordId - Word ID to update
   * @param {string} pathname - URL pathname (default: current location)
   * @returns {string} Update URL
   */
  buildWordUpdateURL(wordId, pathname = window.location.pathname) {
    const { shortName, collectionSlug, identifier, pageNumber } = this.parseLibriscanURL(pathname);
    return `/${shortName}/${collectionSlug}/${identifier}/page${pageNumber}/word/${wordId}/update/`;
  },

  /**
   * Build a word history URL for the current page
   * @param {number} wordId - Word ID to get history for
   * @param {string} pathname - URL pathname (default: current location)
   * @returns {string} History URL
   */
  buildWordHistoryURL(wordId, pathname = window.location.pathname) {
    const { shortName, collectionSlug, identifier, pageNumber } = this.parseLibriscanURL(pathname);
    return `/${shortName}/${collectionSlug}/${identifier}/page${pageNumber}/word/${wordId}/history/`;
  },

  /**
   * Build a word revert URL for the current page
   * @param {number} wordId - Word ID to revert
   * @param {string} pathname - URL pathname (default: current location)
   * @returns {string} Revert URL
   */
  buildWordRevertURL(wordId, pathname = window.location.pathname) {
    const { shortName, collectionSlug, identifier, pageNumber } = this.parseLibriscanURL(pathname);
    return `/${shortName}/${collectionSlug}/${identifier}/page${pageNumber}/word/${wordId}/revert/`;
  },

  /**
   * Build a word toggle review URL for the current page
   * @param {number} wordId - Word ID to toggle review flag
   * @param {string} pathname - URL pathname (default: current location)
   * @returns {string} Toggle review URL
   */
  buildWordToggleReviewURL(wordId, pathname = window.location.pathname) {
    const { shortName, collectionSlug, identifier, pageNumber } = this.parseLibriscanURL(pathname);
    return `/${shortName}/${collectionSlug}/${identifier}/page${pageNumber}/word/${wordId}/toggle-review/`;
  },

  /**
   * Fetch JSON data from a URL with optional authentication
   * @param {string} url - Request URL
   * @param {Object} options - Request options
   * @param {string} options.method - HTTP method (default: 'GET')
   * @param {boolean} options.includeCSRF - Whether to include CSRF token (default: false for GET)
   * @returns {Promise<Object>} Parsed JSON response
   */
  async fetchJSON(url, options = {}) {
    const {
      method = 'GET',
      includeCSRF = method !== 'GET'
    } = options;

    const headers = {
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest'
    };

    if (includeCSRF) {
      const csrfToken = this.getCSRFToken();
      if (csrfToken) {
        headers['X-CSRFToken'] = csrfToken;
      }
    }

    const response = await fetch(url, {
      method,
      headers,
      credentials: 'same-origin'
    });

    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorMessage;
      } catch {
        // If JSON parsing fails, use default error message
      }
      throw new Error(errorMessage);
    }

    return response.json();
  },

  /**
   * Post form data to a URL with CSRF protection
   * @param {string} url - Target URL
   * @param {Object} data - Data to send as form fields
   * @returns {Promise<Object>} Response JSON data
   */
  async postFormData(url, data) {
    const formBody = Object.entries(data)
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
      .join('&');

    const response = await this.makeAuthenticatedRequest(url, {
      method: 'POST',
      body: formBody
    });

    return response.json();
  },

  /**
   * Show a simple toast notification
   * @param {string} message - Message to display
   * @param {string} type - Toast type: 'success', 'error', 'warning', 'info'
   * @param {number} duration - Duration in milliseconds (default: 3000)
   */
  showToast(message, type = 'success', duration = 3000) {
    const toast = document.createElement('div');
    toast.className = `alert alert-${type} fixed bottom-4 right-4 z-50 shadow-lg max-w-sm`;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
      document.body.removeChild(toast);
    }, duration);
  },

  /**
   * Copy text to clipboard
   * @param {string} text - Text to copy
   * @returns {Promise<boolean>} Success status
   */
  async _copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      const success = document.execCommand('copy');
      ta.remove();
      return success;
    }
  },

  /**
   * Copy visible text from an element to clipboard
   * @param {HTMLElement} el - Element containing text to copy
   * @returns {Promise<boolean>} Success status
   */
  async copyElementText(el) {
    const text = el?.innerText?.trim();
    if (!text) return false;
    
    const success = await this._copyToClipboard(text);
    this.showToast(success ? 'Copied' : 'Copy failed', success ? 'success' : 'error');
    return success;
  },

  /**
   * Initialize copy buttons with click handlers
   * @param {string} selector - CSS selector for copy buttons
   */
  initCopyButtons(selector = '.copy-formatted-btn') {
    document.querySelectorAll(selector).forEach(btn => {
      btn.addEventListener('click', () => {
        const content = btn.closest('.prose')?.querySelector('.formatted-text-content');
        this.copyElementText(content);
      });
    });
  },

  /**
   * Get user's timezone from browser settings
   */
  getUserTimezone() {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  },

  /**
   * Format date/time for audit history display
   * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl
   */
  formatDateTime(dateString) {
    const date = new Date(dateString);
    const seconds = Math.floor((Date.now() - date) / 1000);
    const tz = this.getUserTimezone();

    // Calculate relative time
    const units = [[2592000, 'month'], [604800, 'week'], [86400, 'day'], [3600, 'hour'], [60, 'minute']];
    let relative = 'Just now';
    for (const [limit, unit] of units) {
      if (seconds >= limit) {
        relative = new Intl.RelativeTimeFormat('en', { numeric: 'auto' }).format(-Math.floor(seconds / limit), unit);
        break;
      }
    }

    return {
      relative,
      exact: date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', weekday: 'short', timeZone: tz }),
      time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', timeZoneName: 'short', timeZone: tz })
    };
  },

  /**
   * Validate file for upload
   */
  validateFile(file, { maxSize = 5242880, allowedTypes = ['image/jpeg', 'image/png'], allowedExtensions = ['.jpg', '.jpeg', '.png'] } = {}) {
    if (!file) return { valid: false, error: null };

    const ext = file.name.toLowerCase().slice(file.name.lastIndexOf('.'));
    if (!allowedTypes.includes(file.type) || !allowedExtensions.includes(ext)) {
      return { valid: false, error: `Invalid format. Use ${allowedExtensions.join(', ').toUpperCase()}` };
    }

    if (file.size > maxSize) {
      return { valid: false, error: `File too large (${(file.size / 1048576).toFixed(1)}MB). Max ${(maxSize / 1048576).toFixed(0)}MB` };
    }

    return { valid: true, error: null };
  },

  setupFileValidation(input, button, errorDiv, options = {}) {
    const inp = typeof input === 'string' ? document.querySelector(input) : input;
    const btn = typeof button === 'string' ? document.querySelector(button) : button;
    const err = typeof errorDiv === 'string' ? document.querySelector(errorDiv) : errorDiv;

    if (!inp || !btn || !err) return;

    inp.addEventListener('change', (event) => {
      const result = this.validateFile(event.target.files[0], options);
      btn.disabled = !result.valid;
      err.classList.toggle('hidden', result.valid);
      if (result.error) err.querySelector('span').textContent = result.error;
    });
  },

  setButtonLoading(button, isLoading, text) {
    if (!button) return;
    button.disabled = isLoading;
    button.classList.toggle('loading', isLoading);
    if (text) button.textContent = text;
  },

  scrollIntoViewSafe(element, options = { block: 'center', behavior: 'smooth' }) {
    if (!element) return;
    try {
      element.scrollIntoView(options);
    } catch (error) {
      element.scrollIntoView();
    }
  },
};

// Make utils available globally
window.LibriscanUtils = LibriscanUtils;

// Initialize copy buttons if present
if (typeof window !== 'undefined' && window.LibriscanUtils?.initCopyButtons) {
  window.LibriscanUtils.initCopyButtons();
}
