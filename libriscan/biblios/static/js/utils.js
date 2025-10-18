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
      } catch (e) {
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
  }
};

// Make utils available globally
window.LibriscanUtils = LibriscanUtils;
