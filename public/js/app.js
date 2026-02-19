// Main Application File
const App = {
  init: function() {
    console.log('🚀 POS Super Admin Dashboard Initializing...');
    
    // Initialize all components
    this.initializeComponents();
    
    // Setup event listeners
    this.setupEventListeners();
    
    // Load user preferences
    this.loadUserPreferences();
    
    console.log('✅ Dashboard Ready!');
  },

  initializeComponents: function() {
    // Wait for DOM to be fully loaded
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        this.renderComponents();
      });
    } else {
      this.renderComponents();
    }
  },

  renderComponents: function() {
    // Components will auto-initialize from their respective files
    console.log('Components loaded');
  },

  setupEventListeners: function() {
    // Global keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      // Ctrl/Cmd + K for search
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        this.openSearch();
      }

      // Esc to close any modals
      if (e.key === 'Escape') {
        this.closeAllModals();
      }
    });

    // Handle navigation
    window.addEventListener('hashchange', () => {
      this.handleNavigation();
    });
  },

  loadUserPreferences: function() {
    // Load saved preferences from localStorage
    const savedTheme = localStorage.getItem('theme') || 'light';
    const savedEmail = localStorage.getItem('adminEmail') || 'admin@example.com';
    const savedName = localStorage.getItem('adminName') || 'Admin User';

    // Apply preferences
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    // Update header with saved email
    const userEmailElement = document.getElementById('userEmail');
    if (userEmailElement) {
      userEmailElement.textContent = savedEmail;
    }
  },

  openSearch: function() {
    console.log('Search opened');
    // Implement search functionality
  },

  closeAllModals: function() {
    console.log('Closing modals');
    // Implement modal closing
  },

  handleNavigation: function() {
    const hash = window.location.hash.slice(1) || 'dashboard';
    
    if (typeof NavigationManager !== 'undefined') {
        NavigationManager.showSection(hash);
    }
  }
};

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});

// Global error handler
window.addEventListener('error', (e) => {
  console.error('Application Error:', e.error);
});

// Unhandled promise rejection handler
window.addEventListener('unhandledrejection', (e) => {
  console.error('Unhandled Promise Rejection:', e.reason);
});