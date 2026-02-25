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
        UsersPage.load();
        break;
      case "subscriptions":
        SubscriptionsPage.load();
        break;
      case "analytics":
        // Load analytics data
        break;
      case "settings":
        // Load settings data
        break;
      case "dashboard":
        // Dashboard already loaded
        break;
      case "plans":
        PlansPage.load();
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
