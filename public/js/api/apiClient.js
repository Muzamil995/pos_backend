// API Client Utility
const APIClient = {
  baseURL: "http://localhost:3000", // Change to '' if deploying to the same domain

  /**
   * Helper to build standard headers with Auth Token
   * @returns {object} headers
   */
  getHeaders: function () {
    const headers = {
      "Content-Type": "application/json",
    };
    const token = this.getToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    return headers;
  },

  /**
   * Helper to handle responses and auto-logout on 401
   * @param {Response} response
   * @returns {Promise<any>}
   */
  handleResponse: async function (response) {
    if (response.status === 401) {
      // Token is invalid or expired -> Auto Logout
      console.warn("Session expired or unauthorized. Redirecting to login...");
      this.clearToken();
      localStorage.removeItem("user");
      window.location.replace("login.html");
      throw new Error("Session expired");
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  },

  /**
   * GET request
   * @param {string} endpoint
   * @returns {Promise}
   */
  get: function (endpoint) {
    return fetch(`${this.baseURL}${endpoint}`, {
      method: "GET",
      headers: this.getHeaders(),
    }).then((response) => this.handleResponse(response));
  },

  /**
   * POST request
   * @param {string} endpoint
   * @param {object} data
   * @returns {Promise}
   */
  post: function (endpoint, data) {
    return fetch(`${this.baseURL}${endpoint}`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    }).then((response) => this.handleResponse(response));
  },

  /**
   * PUT request
   * @param {string} endpoint
   * @param {object} data
   * @returns {Promise}
   */
  put: function (endpoint, data) {
    return fetch(`${this.baseURL}${endpoint}`, {
      method: "PUT",
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    }).then((response) => this.handleResponse(response));
  },

  /**
   * DELETE request
   * @param {string} endpoint
   * @returns {Promise}
   */
  delete: function (endpoint) {
    return fetch(`${this.baseURL}${endpoint}`, {
      method: "DELETE",
      headers: this.getHeaders(),
    }).then((response) => this.handleResponse(response));
  },

  /**
   * Set Authorization Token
   * @param {string} token
   */
  setToken: function (token) {
    localStorage.setItem("jwt_token", token);
  },

  /**
   * Get Authorization Token
   * @returns {string|null}
   */
  getToken: function () {
    return localStorage.getItem("jwt_token");
  },

  /**
   * Clear Authorization Token
   */
  clearToken: function () {
    localStorage.removeItem("jwt_token");
  },
};

// Make globally available if your app architecture expects it
window.APIClient = APIClient;
