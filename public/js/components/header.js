// Header Component
const HeaderComponent = {
  render: function() {
    return `
      <header>
        <h1>
          <i class="fas fa-chart-bar"></i>
          POS Super Admin
        </h1>
        <div class="user-info">
          <span id="userEmail">admin@example.com</span>
          <div class="avatar">
            <i class="fas fa-user"></i>
          </div>
        </div>
      </header>
    `;
  },

  init: function() {
    const container = document.getElementById('header-container');
    container.innerHTML = this.render();
    this.attachEventListeners();
  },

  attachEventListeners: function() {
    const avatar = document.querySelector('.avatar');
    if (avatar) {
      avatar.addEventListener('click', this.showUserMenu.bind(this));
    }
  },

  showUserMenu: function() {
    console.log('User menu clicked');
    // Add user menu functionality here
  },

  setUserEmail: function(email) {
    const userEmailElement = document.getElementById('userEmail');
    if (userEmailElement) {
      userEmailElement.textContent = email;
    }
  }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  HeaderComponent.init();
});