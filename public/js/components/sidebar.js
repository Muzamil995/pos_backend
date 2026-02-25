// Sidebar Component
const SidebarComponent = {
  items: [
    { id: "dashboard", label: "Dashboard", icon: "fas fa-home" },
    { id: "users", label: "Users", icon: "fas fa-users" },
    { id: "subscriptions", label: "Subscriptions", icon: "fas fa-credit-card" },
    // { id: "analytics", label: "Analytics", icon: "fas fa-chart-line" },
    { id: "plans", label: "Plans", icon: "fas fa-tags" },
    { id: "settings", label: "Settings", icon: "fas fa-cog" },
  ],

  render: function () {
    let html = "<sidebar><nav>";
    this.items.forEach((item, index) => {
      const activeClass = index === 0 ? "active" : "";
      html += `
        <a href="#" class="nav-link ${activeClass}" data-section="${item.id}">
          <i class="${item.icon}"></i> ${item.label}
        </a>
    
      `;
    });

    html += `
      <a href="#" id="logoutBtn" class="logout-btn">
        <i class="fas fa-sign-out-alt"></i> Logout
      </a>
    `;

    html += "</nav></sidebar>";
    return html;
  },

  init: function () {
    const container = document.getElementById("sidebar-container");
    container.innerHTML = this.render();
    this.attachEventListeners();
  },

  attachEventListeners: function () {
    document.querySelectorAll(".nav-link").forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        const sectionId = e.currentTarget.dataset.section;
        this.setActive(sectionId);

        // Added a safety check in case NavigationManager loads slightly after
        if (typeof NavigationManager !== "undefined") {
          NavigationManager.showSection(sectionId);
        }
      });
    });
  },

  setActive: function (sectionId) {
    document.querySelectorAll(".nav-link").forEach((link) => {
      link.classList.remove("active");
    });
    const activeLink = document.querySelector(`[data-section="${sectionId}"]`);
    if (activeLink) {
      activeLink.classList.add("active");
    }
  },
};

// Initialize when DOM is ready
document.addEventListener("DOMContentLoaded", function () {
  SidebarComponent.init();
});
