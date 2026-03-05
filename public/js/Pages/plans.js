const PlansPage = {
  plansData: [], // Store plans locally to populate the modal

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

    if (!mainContent) {
      console.error("Critical Error: 'main-content' div not found in HTML.");
      return;
    }

    if (!document.getElementById("plans")) {
      const section = document.createElement("div");
      section.innerHTML = this.render();
      if (section.firstElementChild) {
        mainContent.appendChild(section.firstElementChild);
      }
    }
    this.load();
  },

  load: function () {
    // Calling the endpoint that matches your admin controller
    APIClient.get("/api/v1/system-plans")
      .then((response) => {
        // We store the data in plansData so openEditModal can find plan details by ID
        // Supporting both .plans and .data depending on your exact API response structure
        this.plansData = response.plans || response.data || [];

        // Pass the array to the table renderer
        this.render_table(this.plansData);
      })
      .catch((err) => {
        console.error("Error loading plans:", err);
        this.showError("Failed to load subscription plans. Please try again.");
      });
  },

  // load: function () {
  //   // Replace with your actual API endpoint
  //   APIClient.get("/api/v1/subscriptions/plans")
  //     .then((response) => {
  //       const plansArray = response.plans || [];
  //       this.render_table(plansArray);
  //     })
  //     .catch((err) => {
  //       console.error("Error loading plans:", err);
  //       this.showError("Failed to load subscription plans.");
  //     });
  // },

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
        val === null || val === undefined || val === ""
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
            <button style="background: #3498db; color: #fff; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; display: flex; align-items: center; gap: 5px;"
              onclick="PlansPage.openEditModal(${plan.id})">
              <i class="fas fa-edit"></i> Edit
            </button>
          </div>
        </td>
      `;
      tbody.appendChild(tr);
    });
  },

  openEditModal: function (planId) {
    // Find the plan from our local data array
    const plan = this.plansData.find((p) => p.id === planId);
    if (!plan) return alert("Plan data not found.");

    // Helper to output empty string if value is null
    const getVal = (val) => (val === null || val === undefined ? "" : val);

    const modal = document.createElement("div");
    modal.id = "planEditModalOverlay";
    modal.style.cssText =
      "position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.7); z-index:9999; display:flex; justify-content:center; align-items:center; overflow-y:auto; padding:20px;";

    modal.innerHTML = `
      <div style="background:#fff; padding:30px; border-radius:12px; max-width:650px; width:100%; box-shadow: 0 10px 30px rgba(0,0,0,0.5); max-height: 90vh; overflow-y: auto;">
        <h3 style="margin-bottom:20px; color:#2c3e50; border-bottom:1px solid #eee; padding-bottom:10px;">
          <i class="fas fa-edit"></i> Edit Plan: ${plan.name}
        </h3>

        <form id="editPlanForm" onsubmit="PlansPage.savePlan(event, ${plan.id})">
          <p style="font-size:13px; color:#e67e22; background:#fdf2e9; padding:10px; border-radius:6px; margin-bottom:20px;">
            <i class="fas fa-info-circle"></i> <strong>Note:</strong> Leave limit fields completely blank to set them as "Unlimited".
          </p>

          <div style="display:grid; grid-template-columns: 1fr 1fr; gap:15px; margin-bottom:20px;">
            <div style="grid-column: span 2;">
              <label style="display:block; font-size:12px; font-weight:bold; margin-bottom:5px; color:#333;">Plan Name <span style="color:red;">*</span></label>
              <input type="text" id="plan_name" value="${getVal(plan.name)}" required style="width:100%; padding:10px; border:1px solid #ddd; border-radius:6px;">
            </div>
            
            <div>
              <label style="display:block; font-size:12px; font-weight:bold; margin-bottom:5px; color:#333;">Price (PKR) <span style="color:red;">*</span></label>
              <input type="number" id="plan_price" value="${getVal(plan.price)}" step="0.01" required style="width:100%; padding:10px; border:1px solid #ddd; border-radius:6px;">
            </div>
            
            <div>
              <label style="display:block; font-size:12px; font-weight:bold; margin-bottom:5px; color:#333;">Duration (Days) <span style="color:red;">*</span></label>
              <input type="number" id="plan_duration" value="${getVal(plan.durationDays)}" required style="width:100%; padding:10px; border:1px solid #ddd; border-radius:6px;">
            </div>

            <div>
              <label style="display:block; font-size:12px; font-weight:bold; margin-bottom:5px; color:#333;">Max Products</label>
              <input type="number" id="plan_products" value="${getVal(plan.maxProducts)}" placeholder="Unlimited" style="width:100%; padding:10px; border:1px solid #ddd; border-radius:6px;">
            </div>

            <div>
              <label style="display:block; font-size:12px; font-weight:bold; margin-bottom:5px; color:#333;">Max Categories</label>
              <input type="number" id="plan_categories" value="${getVal(plan.maxCategories)}" placeholder="Unlimited" style="width:100%; padding:10px; border:1px solid #ddd; border-radius:6px;">
            </div>

            <div>
              <label style="display:block; font-size:12px; font-weight:bold; margin-bottom:5px; color:#333;">Max Customers</label>
              <input type="number" id="plan_customers" value="${getVal(plan.maxCustomers)}" placeholder="Unlimited" style="width:100%; padding:10px; border:1px solid #ddd; border-radius:6px;">
            </div>

            <div>
              <label style="display:block; font-size:12px; font-weight:bold; margin-bottom:5px; color:#333;">Max Employees</label>
              <input type="number" id="plan_employees" value="${getVal(plan.maxEmployees)}" placeholder="Unlimited" style="width:100%; padding:10px; border:1px solid #ddd; border-radius:6px;">
            </div>

            <div>
              <label style="display:block; font-size:12px; font-weight:bold; margin-bottom:5px; color:#333;">Max Suppliers</label>
              <input type="number" id="plan_suppliers" value="${getVal(plan.maxSuppliers)}" placeholder="Unlimited" style="width:100%; padding:10px; border:1px solid #ddd; border-radius:6px;">
            </div>

            <div>
              <label style="display:block; font-size:12px; font-weight:bold; margin-bottom:5px; color:#333;">Max Users</label>
              <input type="number" id="plan_users" value="${getVal(plan.maxUsers)}" placeholder="Unlimited" style="width:100%; padding:10px; border:1px solid #ddd; border-radius:6px;">
            </div>
          </div>

          <div style="margin-bottom:25px; background:#f8f9fa; padding:15px; border-radius:8px; border:1px solid #e9ecef;">
            <label style="display:flex; align-items:center; gap:10px; margin-bottom:12px; cursor:pointer;">
              <input type="checkbox" id="plan_onlineBackup" ${plan.hasOnlineBackup ? "checked" : ""} style="width:18px; height:18px;">
              <span style="font-weight:600; font-size:14px; color:#2c3e50;">Enable Online Backup</span>
            </label>
            <label style="display:flex; align-items:center; gap:10px; cursor:pointer;">
              <input type="checkbox" id="plan_fullBackup" ${plan.hasFullBackupWithImages ? "checked" : ""} style="width:18px; height:18px;">
              <span style="font-weight:600; font-size:14px; color:#2c3e50;">Enable Full Backup (With Images)</span>
            </label>
          </div>

          <div style="display:flex; justify-content:flex-end; gap:12px;">
            <button type="button" onclick="document.getElementById('planEditModalOverlay').remove()" style="background:#95a5a6; color:#fff; border:none; padding:10px 25px; border-radius:6px; cursor:pointer; font-weight:bold;">Cancel</button>
            <button type="submit" id="savePlanBtn" style="background:#27ae60; color:#fff; border:none; padding:10px 25px; border-radius:6px; cursor:pointer; font-weight:bold;">Save Changes</button>
          </div>
        </form>
      </div>
    `;

    document.body.appendChild(modal);
  },

  savePlan: function (event, planId) {
    event.preventDefault();

    const btn = document.getElementById("savePlanBtn");
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';

    // Helper to get value and treat empty string strictly as null
    const getVal = (id) => {
      const val = document.getElementById(id).value.trim();
      return val === "" ? null : val;
    };

    const payload = {
      name: document.getElementById("plan_name").value.trim(),
      price: document.getElementById("plan_price").value,
      durationDays: document.getElementById("plan_duration").value,
      maxProducts: getVal("plan_products"),
      maxCategories: getVal("plan_categories"),
      maxCustomers: getVal("plan_customers"),
      maxEmployees: getVal("plan_employees"),
      maxSuppliers: getVal("plan_suppliers"),
      maxUsers: getVal("plan_users"),
      hasOnlineBackup: document.getElementById("plan_onlineBackup").checked
        ? 1
        : 0,
      hasFullBackupWithImages: document.getElementById("plan_fullBackup")
        .checked
        ? 1
        : 0,
    };

    APIClient.put(`/api/v1/system-plans/${planId}`, payload)
      .then((res) => {
        // Remove the modal
        const modal = document.getElementById("planEditModalOverlay");
        if (modal) modal.remove();

        // Ensure data refreshes automatically
        if (typeof this.load === "function") {
          this.load();
        }
      })
      .catch((err) => {
        console.error("Save plan error:", err);
        alert("Failed to update plan. Please check your connection.");
        btn.disabled = false;
        btn.innerHTML = "Save Changes";
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
