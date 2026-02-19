// Analytics Page
const AnalyticsPage = {
  render: function() {
    return `
      <section id="analytics" class="page-section">
        <div class="dashboard-header">
          <h2><i class="fas fa-chart-line"></i> Analytics</h2>
          <p>System performance and statistics</p>
        </div>

        <div class="cards">
          <div class="card">
            <i class="fas fa-chart-pie"></i>
            <h3>User Growth</h3>
            <p>Track how many new users register each month.</p>
            <button>View Details</button>
          </div>

          <div class="card">
            <i class="fas fa-chart-bar"></i>
            <h3>Revenue Trends</h3>
            <p>Monitor subscription revenue over time.</p>
            <button>View Details</button>
          </div>

          <div class="card">
            <i class="fas fa-percentage"></i>
            <h3>Churn Rate</h3>
            <p>Track subscription cancellations.</p>
            <button>View Details</button>
          </div>
        </div>
      </section>
    `;
  },

  init: function() {
    const mainContent = document.getElementById('main-content');
    const section = document.createElement('div');
    section.innerHTML = this.render();
    mainContent.appendChild(section.firstElementChild);
  }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  AnalyticsPage.init();
});