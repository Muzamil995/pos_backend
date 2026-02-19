// Dashboard Page
const DashboardPage = {
  render: function() {
    return `
      <section id="dashboard" class="page-section active">
        <div class="dashboard-header">
          <h2><i class="fas fa-tachometer-alt"></i> Dashboard Overview</h2>
          <p>Welcome back! Here's your system status.</p>
        </div>

        <div class="stats">
          <div class="stat-box">
            <h4>Total Users</h4>
            <div class="number" id="totalUsers">0</div>
          </div>
          <div class="stat-box">
            <h4>Active Subscriptions</h4>
            <div class="number" id="activeSubscriptions">0</div>
          </div>
          <div class="stat-box">
            <h4>Revenue</h4>
            <div class="number" id="revenue">$0</div>
          </div>
        </div>

        <div class="cards">
          <div class="card">
            <i class="fas fa-user-plus"></i>
            <h3>Add New User</h3>
            <p>Create a new user account and register them in the system.</p>
            <a href="register.html">Register User</a>
          </div>

          <div class="card">
            <i class="fas fa-users"></i>
            <h3>View All Users</h3>
            <p>See all registered users and their details in the system.</p>
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

  init: function() {
    const mainContent = document.getElementById('main-content');
    mainContent.appendChild(this.createSection());
    this.loadStats();
    this.attachEventListeners();
  },

  createSection: function() {
    const section = document.createElement('div');
    section.innerHTML = this.render();
    return section.firstElementChild;
  },

  loadStats: function() {
    APIClient.get('/api/subscription/users')
      .then(data => {
        if (data.users) {
          document.getElementById('totalUsers').textContent = data.users.length;
          const activeCount = data.users.filter(u => u.Status === 'Active').length;
          document.getElementById('activeSubscriptions').textContent = activeCount;
        }
      })
      .catch(err => console.error('Error loading stats:', err));
  },

  attachEventListeners: function() {
    document.querySelectorAll('.nav-action').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const section = e.target.dataset.section;
        SidebarComponent.setActive(section);
        NavigationManager.showSection(section);
      });
    });
  }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  DashboardPage.init();
});