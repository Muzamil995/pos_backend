// Dashboard Page
const DashboardPage = {
  render: function () {
    return `
      <section id="dashboard" class="page-section active">
        <div class="dashboard-header">
          <h2><i class="fas fa-tachometer-alt"></i> Dashboard Overview</h2>
          <p>Welcome back! Here's your system status.</p>
        </div>

        <div class="stats">
          <div class="stat-box">
            <h4>Total Users</h4>
            <div class="number" id="totalUsers">
              <i class="fas fa-spinner fa-spin" style="font-size: 20px;"></i>
            </div>
          </div>
          <div class="stat-box">
            <h4>Active Subscriptions</h4>
            <div class="number" id="activeSubscriptions">
              <i class="fas fa-spinner fa-spin" style="font-size: 20px;"></i>
            </div>
          </div>
          <div class="stat-box">
            <h4>Revenue</h4>
            <div class="number" id="revenue">PKR 0</div>
          </div>
        </div>

        <div class="cards">
          <div class="card">
            <i class="fas fa-user-plus"></i>
            <h3>Add New Owner</h3>
            <p>Create a new owner account and register their business in the system.</p>
            <a href="register.html">Register User</a>
          </div>

          <div class="card">
            <i class="fas fa-users"></i>
            <h3>View All Users</h3>
            <p>See all registered system users and their details.</p>
            <a href="#" class="nav-action" data-section="users">View Users</a>
          </div>

          <div class="card">
            <i class="fas fa-credit-card"></i>
            <h3>Manage Subscriptions</h3>
            <p>View and manage all active subscription plans and users.</p>
            <a href="#" class="nav-action" data-section="subscriptions">View Plans</a>
          </div>
        </div>
      </section>
    `;
  },

  init: function () {
    const mainContent = document.getElementById("main-content");
    mainContent.appendChild(this.createSection());
    this.loadStats();
    this.attachEventListeners();
  },

  createSection: function () {
    const section = document.createElement("div");
    section.innerHTML = this.render();
    return section.firstElementChild;
  },

  loadStats: function () {
    // 1. Fetch data from our new system-owners endpoint
    APIClient.get("/api/v1/system-owners")
      .then((response) => {
        // Handle the nested data structure from the controller
        const users = response.data || [];

        // Update Total Users
        const totalUsersEl = document.getElementById("totalUsers");
        if (totalUsersEl) totalUsersEl.textContent = users.length;

        // Update Active Users (status === 1 in your MySQL schema)
        const activeCount = users.filter((u) => u.status === 1).length;
        const activeSubEl = document.getElementById("activeSubscriptions");
        if (activeSubEl) activeSubEl.textContent = activeCount;

        // Note: Revenue is static for now until a dedicated payment/subscription endpoint is built.
      })
      .catch((err) => {
        console.error("Error loading stats:", err);
        document.getElementById("totalUsers").innerHTML =
          '<span style="color: red; font-size: 16px;">Error</span>';
        document.getElementById("activeSubscriptions").innerHTML =
          '<span style="color: red; font-size: 16px;">Error</span>';
      });
  },

  attachEventListeners: function () {
    document.querySelectorAll(".nav-action").forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        // Look up the closest parent anchor tag in case they clicked the icon inside
        const actionLink = e.target.closest(".nav-action");
        if (actionLink) {
          const section = actionLink.dataset.section;
          if (typeof SidebarComponent !== "undefined")
            SidebarComponent.setActive(section);
          if (typeof NavigationManager !== "undefined")
            NavigationManager.showSection(section);
        }
      });
    });
  },
};

// Initialize when DOM is ready
document.addEventListener("DOMContentLoaded", function () {
  // Prevent double initialization if your app.js already handles routing/init
  if (document.getElementById("dashboard")) return;
  DashboardPage.init();
});
