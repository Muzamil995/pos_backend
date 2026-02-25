// Subscriptions Page
const SubscriptionsPage = {
  render: function () {
    return `
      <section id="subscriptions" class="page-section">
        <div class="dashboard-header">
          <h2><i class="fas fa-credit-card"></i> User Subscriptions</h2>
          <p>All active and inactive subscriptions</p>
        </div>

        <div class="table-container">
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
              </tr>
            </thead>
            <tbody id="subscriptionsBody">
              <tr>
                <td colspan="7" style="text-align: center; padding: 30px;">
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

    // Trigger the fetch request immediately after rendering
    this.load();
  },

  load: function () {
    // Point to the correct API v1 endpoint
    APIClient.get("/api/v1/system-subscriptions")
      .then((response) => {
        // Handle standard backend response { success: true, data: [...] } or direct array
        let subs = response.data || response || [];

        // Ensure it's an array (just in case the API returns a single object for the logged-in owner)
        if (!Array.isArray(subs)) {
          subs = [subs];
        }

        this.render_table(subs);
      })
      .catch((err) => {
        console.error("Error loading subscriptions:", err);
        this.showError(
          "Failed to load subscriptions. Please check your connection.",
        );
      });
  },

  render_table: function (subscriptions) {
    const tbody = document.getElementById("subscriptionsBody");
    tbody.innerHTML = "";

    if (
      subscriptions.length === 0 ||
      (subscriptions.length === 1 && Object.keys(subscriptions[0]).length === 0)
    ) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align: center; padding: 30px; color: #7f8c8d;">
            <i class="fas fa-inbox" style="font-size: 32px; margin-bottom: 10px;"></i>
            <p>No subscriptions found</p>
          </td>
        </tr>
      `;
      return;
    }

    subscriptions.forEach((sub) => {
      const tr = document.createElement("tr");

      // Map DB schema values. In your schema, status is a string ('Active')
      const status = sub.status || "Active";
      const statusClass =
        status.toLowerCase() === "active" ? "status-active" : "status-inactive";

      // Helper function to format dates nicely
      const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleDateString();
      };

      tr.innerHTML = `
        <!-- Using lowercase/camelCase to match your MySQL schema -->
        <td>${sub.id || "N/A"}</td>
        <td>${sub.userName || sub.name || "Owner"}</td>
        <td>${sub.planName || "Basic Plan"}</td>
        <td>
          <span class="status-badge ${statusClass}">${status}</span>
        </td>
        <td>${formatDate(sub.startDate)}</td>
        <td>${formatDate(sub.endDate)}</td>
        <td>PKR ${sub.price !== undefined ? sub.price : "0"}</td>
      `;
      tbody.appendChild(tr);
    });
  },

  showError: function (message) {
    const tbody = document.getElementById("subscriptionsBody");
    tbody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align: center; padding: 30px; color: #e74c3c;">
          <i class="fas fa-exclamation-circle" style="font-size: 32px; margin-bottom: 10px;"></i>
          <p>${message}</p>
        </td>
      </tr>
    `;
  },
};

// Initialize when DOM is ready
document.addEventListener("DOMContentLoaded", function () {
  // Prevent double initialization if your app.js handles it
  if (document.getElementById("subscriptions")) return;
  SubscriptionsPage.init();
});
