// Subscriptions Page
const SubscriptionsPage = {
  subscriptionsData: [], // Local state for filtering

  render: function () {
    return `
      <section id="subscriptions" class="page-section">
        <div class="dashboard-header">
          <h2><i class="fas fa-credit-card"></i> User Subscriptions</h2>
          <p>Review and approve pending plan subscriptions</p>
        </div>

        <div class="filter-bar" style="display: flex; gap: 15px; margin-bottom: 20px; background: #f8f9fa; padding: 15px; border-radius: 8px; border: 1px solid #eee; align-items: center;">
          <div style="flex: 1; position: relative;">
            <i class="fas fa-search" style="position: absolute; left: 10px; top: 12px; color: #95a5a6;"></i>
            <input type="text" id="subSearch" placeholder="Search by user or plan name..." 
              style="width: 100%; padding: 10px 10px 10px 35px; border: 1px solid #ddd; border-radius: 6px;"
              onkeyup="SubscriptionsPage.filterTable()">
          </div>
          
          <div style="width: 200px;">
            <select id="subStatusFilter" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 6px; cursor: pointer;"
              onchange="SubscriptionsPage.filterTable()">
              <option value="all">All Statuses</option>
              <option value="Pending">Pending Approval</option>
              <option value="Active">Active</option>
              <option value="Rejected">Rejected</option>
              <option value="Expired">Expired</option>
            </select>
          </div>
        </div>

        <div class="table-container" style="overflow-x: auto;">
          <table id="subscriptionsTable">
            <thead>
              <tr>
                <th>ID</th>
                <th>User Name</th>
                <th>Plan</th>
                <th>Status</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Price</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody id="subscriptionsBody">
              <tr>
                <td colspan="8" style="text-align: center; padding: 30px;">
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

    if (!document.getElementById("subscriptions")) {
      const section = document.createElement("div");
      section.innerHTML = this.render();
      mainContent.appendChild(section.firstElementChild);
    }

    this.load();
  },

  load: function () {
    APIClient.get("/api/v1/system-subscriptions")
      .then((response) => {
        let subs = response.data || response || [];
        if (!Array.isArray(subs)) subs = [subs];
        this.subscriptionsData = subs;
        this.render_table(subs);
      })
      .catch((err) => {
        console.error("Error loading subscriptions:", err);
        this.showError("Failed to load subscriptions.");
      });
  },

  // Combined Search and Status Filter
  filterTable: function () {
    const searchTerm = document.getElementById("subSearch").value.toLowerCase();
    const statusValue = document.getElementById("subStatusFilter").value;

    const filtered = this.subscriptionsData.filter((sub) => {
      const userName = (sub.userName || "").toLowerCase();
      const planName = (sub.planName || "").toLowerCase();

      const matchesSearch =
        userName.includes(searchTerm) || planName.includes(searchTerm);
      const matchesStatus = statusValue === "all" || sub.status === statusValue;

      return matchesSearch && matchesStatus;
    });

    this.render_table(filtered);
  },

  render_table: function (subscriptions) {
    const tbody = document.getElementById("subscriptionsBody");
    if (!tbody) return;
    tbody.innerHTML = "";

    if (subscriptions.length === 0) {
      tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding:30px; color:#7f8c8d;">No matching subscriptions found</td></tr>`;
      return;
    }

    const formatDate = (dateString) => {
      if (!dateString) return "N/A";
      return new Date(dateString).toLocaleDateString();
    };

    subscriptions.forEach((sub) => {
      const status = sub.status || "Pending";
      let statusClass = "status-inactive";
      if (status === "Active") statusClass = "status-active";
      if (status === "Pending") statusClass = "status-pending";

      let actionBtn = "";
      if (status === "Pending") {
        const proofImg =
          sub.paymentProof && sub.paymentProof !== "null"
            ? sub.paymentProof
            : "";
        actionBtn = `
          <button style="background: #f39c12; color: #fff; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-weight:bold;" 
            onclick="SubscriptionsPage.openPaymentModal(${sub.id}, '${proofImg}')">
            <i class="fas fa-search"></i> Review
          </button>
        `;
      } else {
        actionBtn = `<span style="color: #7f8c8d; font-size: 12px;">Processed</span>`;
      }

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${sub.id}</td>
        <td style="font-weight: 600;">${sub.userName || "Owner"}</td>
        <td>${sub.planName || "Plan"}</td>
        <td><span class="status-badge ${statusClass}">${status}</span></td>
        <td>${formatDate(sub.startDate)}</td>
        <td>${formatDate(sub.endDate)}</td>
        <td style="font-weight:bold;">PKR ${Number(sub.price || 0).toLocaleString()}</td>
        <td>${actionBtn}</td>
      `;
      tbody.appendChild(tr);
    });
  },

  openPaymentModal: function (subId, proofImage) {
    const imageHtml = proofImage
      ? `<img src="${proofImage}" style="max-width:100%; max-height:400px; border-radius:8px; margin-bottom:20px; border: 1px solid #ddd;" onerror="this.src=''; this.alt='Image not found';">`
      : `<div style="padding:40px; background:#f8f9fa; color:#e74c3c; margin-bottom:20px; border-radius:8px; border:1px solid #ddd;">No Payment Proof Uploaded</div>`;

    const modal = document.createElement("div");
    modal.id = "paymentModalOverlay";
    modal.style.cssText =
      "position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.7); z-index:9999; display:flex; justify-content:center; align-items:center;";

    modal.innerHTML = `
      <div style="background:#fff; padding:30px; border-radius:12px; max-width:500px; width:90%; text-align:center; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
        <h3 style="margin-bottom:20px; color:#2c3e50;">Review Payment Proof</h3>
        ${imageHtml}
        <div style="display:flex; justify-content:center; gap:15px; margin-top: 10px;">
          <button onclick="SubscriptionsPage.updatePayment(${subId}, 'Approved')" style="background:#27ae60; color:#fff; border:none; padding:10px 20px; border-radius:6px; cursor:pointer; font-weight:bold; flex:1;">Approve</button>
          <button onclick="SubscriptionsPage.updatePayment(${subId}, 'Rejected')" style="background:#e74c3c; color:#fff; border:none; padding:10px 20px; border-radius:6px; cursor:pointer; font-weight:bold; flex:1;">Reject</button>
          <button onclick="document.getElementById('paymentModalOverlay').remove()" style="background:#95a5a6; color:#fff; border:none; padding:10px 20px; border-radius:6px; cursor:pointer; font-weight:bold; flex:1;">Cancel</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  },

  updatePayment: function (subId, decision) {
    const btns = document.querySelectorAll("#paymentModalOverlay button");
    btns.forEach((b) => (b.disabled = true));

    const endpoint =
      decision === "Approved" ? "/approve-payment" : "/reject-payment";

    APIClient.post(`/api/v1/system-subscriptions${endpoint}`, { id: subId })
      .then(() => {
        const modal = document.getElementById("paymentModalOverlay");
        if (modal) modal.remove();
        this.load();
      })
      .catch((err) => {
        console.error(err);
        alert("Failed to update payment.");
        btns.forEach((b) => (b.disabled = false));
      });
  },

  showError: function (message) {
    const tbody = document.getElementById("subscriptionsBody");
    if (tbody)
      tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; padding: 30px; color: #e74c3c;"><p>${message}</p></td></tr>`;
  },
};

document.addEventListener("DOMContentLoaded", function () {
  if (document.getElementById("subscriptions")) return;
  SubscriptionsPage.init();
});
