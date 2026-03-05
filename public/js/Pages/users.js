// Users Page
const UsersPage = {
  usersData: [], // Local state of all owners from DB

  render: function () {
    return `
      <section id="users" class="page-section">
        <div class="dashboard-header">
          <h2><i class="fas fa-users"></i> Registered Users</h2>
          <p>All owners in the system</p>
        </div>

        <div class="filter-bar" style="display: flex; gap: 15px; margin-bottom: 20px; background: #f8f9fa; padding: 15px; border-radius: 8px; border: 1px solid #eee; align-items: center;">
          <div style="flex: 1; position: relative;">
            <i class="fas fa-search" style="position: absolute; left: 10px; top: 12px; color: #95a5a6;"></i>
            <input type="text" id="userSearch" placeholder="Search by name or email..." 
              style="width: 100%; padding: 10px 10px 10px 35px; border: 1px solid #ddd; border-radius: 6px;"
              onkeyup="UsersPage.filterTable()">
          </div>
          
          <div style="width: 200px;">
            <select id="statusFilter" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 6px; cursor: pointer;"
              onchange="UsersPage.filterTable()">
              <option value="all">All Statuses</option>
              <option value="1">Active Only</option>
              <option value="0">Inactive Only</option>
            </select>
          </div>
        </div>

        <div class="table-container" style="overflow-x: auto;">
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
    if (!mainContent) return;

    if (!document.getElementById("users")) {
      const section = document.createElement("div");
      section.innerHTML = this.render();
      mainContent.appendChild(section.firstElementChild);
    }

    this.load();
  },

  load: function () {
    APIClient.get("/api/v1/system-owners")
      .then((response) => {
        this.usersData = response.data || response.owners || [];
        this.render_table(this.usersData);
      })
      .catch((err) => {
        console.error("Error loading users:", err);
        this.showError("Failed to load users. Please check your connection.");
      });
  },

  // Logic to handle searching and filtering local data
  filterTable: function () {
    const searchTerm = document
      .getElementById("userSearch")
      .value.toLowerCase();
    const statusValue = document.getElementById("statusFilter").value;

    const filtered = this.usersData.filter((user) => {
      const matchesSearch =
        user.name.toLowerCase().includes(searchTerm) ||
        user.email.toLowerCase().includes(searchTerm);

      const matchesStatus =
        statusValue === "all" || user.status.toString() === statusValue;

      return matchesSearch && matchesStatus;
    });

    this.render_table(filtered);
  },

  render_table: function (users) {
    const tbody = document.getElementById("usersBody");
    if (!tbody) return;

    tbody.innerHTML = "";

    if (!users || users.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="5" style="text-align: center; padding: 30px; color: #7f8c8d;">
            <i class="fas fa-user-slash" style="font-size: 32px; margin-bottom: 10px;"></i>
            <p>No matching users found</p>
          </td>
        </tr>
      `;
      return;
    }

    users.forEach((user) => {
      const isActive = user.status === 1;
      const statusBadge = isActive
        ? `<span style="background: #e8f5e9; color: #2e7d32; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold;"><i class="fas fa-check-circle"></i> Active</span>`
        : `<span style="background: #ffebee; color: #c62828; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold;"><i class="fas fa-times-circle"></i> Inactive</span>`;

      const actionText = isActive ? "Deactivate" : "Activate";
      const actionColor = isActive ? "#e67e22" : "#27ae60";

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${user.id}</td>
        <td style="font-weight: 600;">${user.name}</td>
        <td>${user.email}</td>
        <td>${statusBadge}</td>
        <td>
          <div class="action-links">
            <button 
              style="background: ${actionColor}; color: #fff; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 12px; font-weight: bold;"
              onclick="UsersPage.toggleStatus(${user.id}, ${user.status})">
              ${actionText}
            </button>
          </div>
        </td>
      `;
      tbody.appendChild(tr);
    });
  },

  toggleStatus: function (userId, currentStatus) {
    const newStatus = currentStatus === 1 ? 0 : 1;
    const actionLabel = newStatus === 1 ? "activate" : "deactivate";

    if (!confirm(`Are you sure you want to ${actionLabel} this user?`)) return;

    APIClient.post(`/api/v1/system-owners/status`, {
      id: userId,
      status: newStatus,
    })
      .then(() => {
        this.load(); // Reload and re-filter will happen after fetch
      })
      .catch((err) => {
        console.error("Error updating status:", err);
        alert("Failed to update user status.");
      });
  },

  showError: function (message) {
    const tbody = document.getElementById("usersBody");
    if (!tbody) return;
    tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; padding: 30px; color: #e74c3c;"><p>${message}</p></td></tr>`;
  },
};

document.addEventListener("DOMContentLoaded", function () {
  if (document.getElementById("users")) return;
  UsersPage.init();
});
