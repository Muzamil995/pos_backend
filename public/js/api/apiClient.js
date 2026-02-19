// API Client Utility
const APIClient = {
  baseURL: 'http://localhost:3000',

  /**
   * GET request
   * @param {string} endpoint
   * @returns {Promise}
   */
  get: function(endpoint) {
    return fetch(`${this.baseURL}${endpoint}`)
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      });
  },

  /**
   * POST request
   * @param {string} endpoint
   * @param {object} data
   * @returns {Promise}
   */
  post: function(endpoint, data) {
    return fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      });
  },

  /**
   * PUT request
   * @param {string} endpoint
   * @param {object} data
   * @returns {Promise}
   */
  put: function(endpoint, data) {
    return fetch(`${this.baseURL}${endpoint}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      });
  },

  /**
   * DELETE request
   * @param {string} endpoint
   * @returns {Promise}
   */
  delete: function(endpoint) {
    return fetch(`${this.baseURL}${endpoint}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      }
    })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      });
  },

  /**
   * Set Authorization Token
   * @param {string} token
   */
  setToken: function(token) {
    localStorage.setItem('authToken', token);
  },

  /**
   * Get Authorization Token
   * @returns {string|null}
   */
  getToken: function() {
    return localStorage.getItem('authToken');
  },

  /**
   * Clear Authorization Token
   */
  clearToken: function() {
    localStorage.removeItem('authToken');
  }
};