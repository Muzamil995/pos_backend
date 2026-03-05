// Navigation Manager
const NavigationManager = {
  currentSection: "dashboard",

  /**
   * Show a section and load its data
   * @param {string} sectionId
   */
  showSection: function (sectionId) {
    // Hide all sections
    document.querySelectorAll(".page-section").forEach((section) => {
      section.classList.remove("active");
    });

    // Show selected section
    const section = document.getElementById(sectionId);
    if (section) {
      section.classList.add("active");
    }

    this.currentSection = sectionId;

    // Load section-specific data
    this.loadSectionData(sectionId);
  },

  /**
   * Load data for specific section
   * @param {string} sectionId
   */
  loadSectionData: function (sectionId) {
    switch (sectionId) {
      case "users":
        if (typeof UsersPage !== "undefined") UsersPage.load();
        break;
      case "subscriptions":
        if (typeof SubscriptionsPage !== "undefined") SubscriptionsPage.load();
        break;
      case "plans":
        if (typeof PlansPage !== "undefined") PlansPage.load();
        break;
      case "settings":
        if (typeof SettingsPage !== "undefined") {
          // If the settings page hasn't been added to the DOM yet, initialize it
          if (!document.getElementById("settings")) {
            SettingsPage.init();
          } else {
            // Otherwise, just refresh the data in the form fields
            SettingsPage.loadUserData();
          }
        }
        break;
      case "dashboard":
        // If your dashboard has a load function, you can optionally call it here to refresh stats
        if (typeof DashboardPage !== "undefined" && DashboardPage.loadStats) {
          DashboardPage.loadStats();
        }
        break;
      case "analytics":
        // Load analytics data (Placeholder for future)
        break;
    }
  },

  /**
   * Get current section
   * @returns {string}
   */
  getCurrentSection: function () {
    return this.currentSection;
  },
};
