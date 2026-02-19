// Subscriptions Page
const SubscriptionsPage = {
  render: function() {
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
        console.error('Error loading subscriptions:', err);
        this.showError('Failed to load subscriptions');
      });
  },

  render_table: function(users) {
    const tbody = document.getElementById('subscriptionsBody');
    tbody.innerHTML = '';

    if (users.length === 0) {
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

    users.forEach(user => {
      const tr = document.createElement('tr');
      const status = user.Status || 'Active';
      const statusClass = status === 'Active' ? 'status-active' : 'status-inactive';
      
      tr.innerHTML = `
        <td>${user.Id}</td>
        <td>${user.Name}</td>
        <td>${user.PlanName || 'Basic'}</td>
        <td>
          <span class="status-badge ${statusClass}">${status}</span>
        </td>
        <td>${user.StartDate || 'N/A'}</td>
        <td>${user.EndDate || 'N/A'}</td>
        <td>$${user.Price || '0'}</td>
      `;
      tbody.appendChild(tr);
    });
  },

  showError: function(message) {
    const tbody = document.getElementById('subscriptionsBody');
    tbody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align: center; padding: 30px; color: #e74c3c;">
          <i class="fas fa-exclamation-circle" style="font-size: 32px; margin-bottom: 10px;"></i>
          <p>${message}</p>
        </td>
      </tr>
    `;
  }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  SubscriptionsPage.init();
});