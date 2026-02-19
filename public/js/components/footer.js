// Footer Component
const FooterComponent = {
  render: function() {
    const year = new Date().getFullYear();
    return `
      <footer>
        <p>&copy; ${year} POS Super Admin System. All rights reserved. | 
          <a href="#">Privacy Policy</a> | 
          <a href="#">Terms of Service</a>
        </p>
        <p>Contact: T: 92 335 5265622 | E: info@goftechsolutions.com</p>
      </footer>
    `;
  },

  init: function() {
    const container = document.getElementById('footer-container');
    container.innerHTML = this.render();
  }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  FooterComponent.init();
});