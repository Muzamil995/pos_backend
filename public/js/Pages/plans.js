const PlansPage = {
  render: function () {
    return `
      <section id="plans" class="page-section">
        <div class="dashboard-header">
          <h2><i class="fas fa-tags"></i> Subscription Plans</h2>
          <p>Manage SaaS pricing and plan limits</p>
        </div>

        <div class="table-container" style="overflow-x: auto;">
          <table id="plansTable">
            <thead>
              <tr>
                <th>ID</th>
                <th>Plan Name</th>
                <th>Price (PKR)</th>
                <th>Duration</th>
                <th>Products</th>
                <th>Categories</th>
                <th>Customers</th>
                <th>Employees</th>
                <th>Suppliers</th>
                <th>Users</th>
                <th>Backup</th>
                <th>Full Backup</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody id="plansBody">
              <tr>
                <td colspan="13" style="text-align: center; padding: 30px;">
                  <i class="fas fa-spinner fa-spin"></i> Loading Plans...
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

    // Safety Check: If main-content doesn't exist, stop here to avoid error
    if (!mainContent) {
      console.error("Critical Error: 'main-content' div not found in HTML.");
      return;
    }

    if (!document.getElementById("plans")) {
      const section = document.createElement("div");
      section.innerHTML = this.render();
      // Ensure we are appending the actual element
      if (section.firstElementChild) {
        mainContent.appendChild(section.firstElementChild);
      }
    }
    this.load();
  },

  load: function () {
    // Replace with your actual API endpoint
    APIClient.get("/api/v1/subscriptions/plans")
      .then((response) => {
        const plansArray = response.plans || [];
        this.render_table(plansArray);
      })
      .catch((err) => {
        console.error("Error loading plans:", err);
        this.showError("Failed to load subscription plans.");
      });
  },

  render_table: function (plans) {
    const tbody = document.getElementById("plansBody");
    if (!tbody) return;

    tbody.innerHTML = "";

    if (!plans || plans.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="13" style="text-align: center; padding: 30px; color: #7f8c8d;">
            <i class="fas fa-inbox" style="font-size: 32px; margin-bottom: 10px;"></i>
            <p>No active plans found</p>
          </td>
        </tr>
      `;
      return;
    }

    plans.forEach((plan) => {
      // Helper to handle Unlimited/Null values
      const formatLimit = (val) =>
        val === null || val === undefined
          ? '<span style="color: #27ae60; font-weight: bold;">∞</span>'
          : val;

      // Helper for Checkmarks
      const formatCheck = (val) =>
        val
          ? '<i class="fas fa-check" style="color: #27ae60;"></i>'
          : '<i class="fas fa-times" style="color: #e74c3c;"></i>';

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${plan.id}</td>
        <td style="font-weight: 600; white-space: nowrap;">${plan.name}</td>
        <td>${Number(plan.price).toLocaleString()}</td>
        <td>${plan.durationDays} Days</td>
        <td>${formatLimit(plan.maxProducts)}</td>
        <td>${formatLimit(plan.maxCategories)}</td>
        <td>${formatLimit(plan.maxCustomers)}</td>
        <td>${formatLimit(plan.maxEmployees)}</td>
        <td>${formatLimit(plan.maxSuppliers)}</td>
        <td>${formatLimit(plan.maxUsers)}</td>
        <td style="text-align: center;">${formatCheck(plan.hasOnlineBackup)}</td>
        <td style="text-align: center;">${formatCheck(plan.hasFullBackupWithImages)}</td>
        <td>
          <div class="action-links">
            <a href="#" class="edit" onclick="alert('Edit Plan ID: ${plan.id}'); return false;">Edit</a>
          </div>
        </td>
      `;
      tbody.appendChild(tr);
    });
  },

  showError: function (message) {
    const tbody = document.getElementById("plansBody");
    if (tbody) {
      tbody.innerHTML = `
          <tr>
            <td colspan="13" style="text-align: center; padding: 30px; color: #e74c3c;">
              <i class="fas fa-exclamation-circle" style="font-size: 32px; margin-bottom: 10px;"></i>
              <p>${message}</p>
            </td>
          </tr>
        `;
    }
  },
};

// Initialize
document.addEventListener("DOMContentLoaded", function () {
  if (document.getElementById("plans")) return;
  PlansPage.init();
});
