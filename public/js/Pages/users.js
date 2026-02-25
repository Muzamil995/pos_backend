// Users Page
const UsersPage = {
  render: function () {
    return `
      <section id="users" class="page-section">
        <div class="dashboard-header">
          <h2><i class="fas fa-users"></i> Registered Users</h2>
          <p>All owners in the system</p>
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

  init: function () {
    const mainContent = document.getElementById("main-content");
    const section = document.createElement("div");
    section.innerHTML = this.render();
    mainContent.appendChild(section.firstElementChild);
    this.load();
  },

  load: function () {
    APIClient.get("/api/v1/system-owners")
      .then((response) => {
        const usersArray = response.data || [];
        this.render_table(usersArray);
      })
      .catch((err) => {
        console.error("Error loading users:", err);
        this.showError("Failed to load users. Please check your connection.");
      });
  },

  render_table: function (users) {
    const tbody = document.getElementById("usersBody");
    tbody.innerHTML = "";

    if (users.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="5" style="text-align: center; padding: 30px; color: #7f8c8d;">
            <i class="fas fa-inbox" style="font-size: 32px; margin-bottom: 10px;"></i>
            <p>No owners found</p>
          </td>
        </tr>
      `;
      return;
    }

    users.forEach((user) => {
      // Matches MySQL schema where status 1 is active
      const isActive = user.status === 1;
      const statusText = isActive ? "Active" : "Inactive";
      const statusClass = isActive ? "status-active" : "status-inactive";

      // Dynamic button text based on current status
      const actionText = isActive ? "Deactivate" : "Activate";
      const actionClass = isActive ? "deactivate-btn" : "activate-btn";

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${user.id}</td>
        <td>${user.name}</td>
        <td>${user.email}</td>
        <td>
          <span class="status-badge ${statusClass}">${statusText}</span>
        </td>
        <td>
          <div class="action-links">
            <a href="#" class="edit" onclick="UsersPage.editUser(${user.id}); return false;">Edit</a>
            <a href="#" class="${actionClass}" onclick="UsersPage.toggleStatus(${user.id}, ${user.status}); return false;">
              ${actionText}
            </a>
          </div>
        </td>
      `;
      tbody.appendChild(tr);
    });
  },

  editUser: function (userId) {
    console.log("Edit user:", userId);
    alert(`Edit functionality for user ${userId}`);
  },

  // New Status Toggle Logic
  toggleStatus: function (userId, currentStatus) {
    const newStatus = currentStatus === 1 ? 0 : 1;
    const action = newStatus === 1 ? "activate" : "deactivate";

    if (!confirm(`Are you sure you want to ${action} this user?`)) return;

    APIClient.post(`/api/v1/system-owners/users/status`, {
      id: userId,
      status: newStatus,
    })
      .then(() => {
        alert(`User status updated successfully!`);
        UsersPage.load(); // reloads table
      })
      .catch((err) => {
        console.error("Error updating status:", err);
        alert("Failed to update user status.");
      });
  },

  showError: function (message) {
    const tbody = document.getElementById("usersBody");
    tbody.innerHTML = `
      <tr> 
        <td colspan="5" style="text-align: center; padding: 30px; color: #e74c3c;"> 
          <i class="fas fa-exclamation-circle" style="font-size: 32px; margin-bottom: 10px;"></i> 
          <p>${message}</p> 
        </td> 
      </tr>`;
  },
};

document.addEventListener("DOMContentLoaded", function () {
  UsersPage.init();
});
