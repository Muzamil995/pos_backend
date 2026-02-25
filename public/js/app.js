// Main Application File
const App = {
  init: function () {
    // ==========================================
    // 🛡️ FRONTEND AUTH GUARD
    // ==========================================
    const token = localStorage.getItem("jwt_token");

    if (!token) {
      console.warn("Unauthorized access attempt. Redirecting to login...");
      window.location.replace("login.html");
      return; // Stop initialization completely
    }

    console.log("🚀 POS Super Admin Dashboard Initializing...");

    // Initialize all components
    this.initializeComponents();

    // Setup event listeners
    this.setupEventListeners();

    // Load user preferences
    this.loadUserPreferences();

    console.log("✅ Dashboard Ready!");
  },

  initializeComponents: function () {
    // Wait for DOM to be fully loaded
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => {
        this.renderComponents();
      });
    } else {
      this.renderComponents();
    }
  },

  renderComponents: function () {
    // Components will auto-initialize from their respective files
    console.log("Components loaded");
  },

  setupEventListeners: function () {
    // Global keyboard shortcuts
    document.addEventListener("keydown", (e) => {
      // Ctrl/Cmd + K for search
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        this.openSearch();
      }

      // Esc to close any modals
      if (e.key === "Escape") {
        this.closeAllModals();
      }
    });

    // Handle navigation
    window.addEventListener("hashchange", () => {
      this.handleNavigation();
    });

    // Handle Logout Action (Attach to your logout button if it exists)
    const logoutBtn = document.getElementById("logoutBtn"); // Update ID if your HTML uses a different one
    if (logoutBtn) {
      logoutBtn.addEventListener("click", (e) => {
        e.preventDefault();
        localStorage.removeItem("jwt_token");
        localStorage.removeItem("user");
        window.location.replace("login.html");
      });
    }
  },

  loadUserPreferences: function () {
    // Load saved preferences from localStorage
    const savedTheme = localStorage.getItem("theme") || "light";

    // Apply theme
    document.documentElement.setAttribute("data-theme", savedTheme);

    // Get the REAL logged-in user data from localStorage (set during login)
    const userStr = localStorage.getItem("user");

    if (userStr) {
      try {
        const user = JSON.parse(userStr);

        // Update header with real email and name
        const userEmailElement = document.getElementById("userEmail");
        const userNameElement = document.getElementById("userName"); // Assuming you have an ID for the name

        if (userEmailElement) userEmailElement.textContent = user.email;
        if (userNameElement) userNameElement.textContent = user.name || "Admin";
      } catch (err) {
        console.error("Failed to parse user data from localStorage", err);
      }
    } else {
      // Fallback if user object is somehow missing but token exists
      const userEmailElement = document.getElementById("userEmail");
      if (userEmailElement) userEmailElement.textContent = "Admin User";
    }
  },

  openSearch: function () {
    console.log("Search opened");
    // Implement search functionality
  },

  closeAllModals: function () {
    console.log("Closing modals");
    // Implement modal closing
  },

  handleNavigation: function () {
    const hash = window.location.hash.slice(1) || "dashboard";

    if (typeof NavigationManager !== "undefined") {
      NavigationManager.showSection(hash);
    }
  },
};

// Initialize app when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  App.init();
});

// Global error handler
window.addEventListener("error", (e) => {
  console.error("Application Error:", e.error);
});

// Unhandled promise rejection handler
window.addEventListener("unhandledrejection", (e) => {
  console.error("Unhandled Promise Rejection:", e.reason);
});
