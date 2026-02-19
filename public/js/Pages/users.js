// Users Page
const UsersPage = {
  render: function() {
    return `
      <section id="users" class="page-section">
        <div class="dashboard-header">
          <h2><i class="fas fa-users"></i> Registered Users</h2>
          <p>All users in the system</p>
        </div>

        <div class="table-container">
          <table id="usersTable">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody id="usersBody">
              <tr>
                <td colspan="5" style="text-align: center; padding: 30px;">
                  <i class="fas fa-spinner fa-spin"></i> Loading...
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    `;
  },

  init: function() {
    const mainContent = document.getElementById('main-content');
    const section = document.createElement('div');
    section.innerHTML = this.render();
    mainContent.appendChild(section.firstElementChild);
  },

  load: function() {
    APIClient.get('/api/subscription/users')
      .then(data => {
        this.render_table(data.users || []);
      })
      .catch(err => {
        console.error('Error loading users:', err);
        this.showError('Failed to load users');
      });
  },

  render_table: function(users) {
    const tbody = document.getElementById('usersBody');
    tbody.innerHTML = '';

    if (users.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="5" style="text-align: center; padding: 30px; color: #7f8c8d;">
            <i class="fas fa-inbox" style="font-size: 32px; margin-bottom: 10px;"></i>
            <p>No users found</p>
          </td>
        </tr>
      `;
      return;
    }

    users.forEach(user => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${user.Id}</td>
        <td>${user.Name}</td>
        <td>${user.Email}</td>
        <td>
          <span class="status-badge status-active">Active</span>
        </td>
        <td>
          <div class="action-links">
            <a href="#" class="edit" onclick="UsersPage.editUser(${user.Id}); return false;">Edit</a>
            <a href="#" class="delete" onclick="UsersPage.deleteUser(${user.Id}); return false;">Delete</a>
          </div>
        </td>
      `;
      tbody.appendChild(tr);
    });
  },

  editUser: function(userId) {
    console.log('Edit user:', userId);
    // Add edit functionality
    alert(`Edit functionality for user ${userId}`);
  },

  deleteUser: function(userId) {
    if (confirm('Are you sure you want to delete this user?')) {
      console.log('Delete user:', userId);
      // Add delete functionality
      alert(`Delete functionality for user ${userId}`);
    }
  },

  showError: function(message) {
    const tbody = document.getElementById('usersBody');
    tbody.innerHTML = `
      <tr>
        <td colspan="5" style="text-align: center; padding: 30px; color: #e74c3c;">
          <i class="fas fa-exclamation-circle" style="font-size: 32px; margin-bottom: 10px;"></i>
          <p>${message}</p>
        </td>
      </tr>
    `;
  }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  UsersPage.init();
});