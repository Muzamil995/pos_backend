// Settings Page
const SettingsPage = {
  render: function () {
    return `
      <section id="settings" class="page-section">
        <div class="dashboard-header">
          <h2><i class="fas fa-cog"></i> Account Settings</h2>
          <p>Update your Super Admin profile and security preferences</p>
        </div>

        <div class="settings-container" style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 20px;">
          
          <!-- Profile Form -->
          <div class="card" style="padding: 25px; background: #fff; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.05);">
            <h3 style="margin-bottom: 20px; border-bottom: 1px solid #eee; padding-bottom: 10px;"><i class="fas fa-user"></i> Profile Information</h3>
            
            <div id="profileAlert" class="alert-message" style="display: none; padding: 10px; border-radius: 5px; margin-bottom: 15px;"></div>
            
            <form id="profileForm">
              <div style="margin-bottom: 15px;">
                <label style="display: block; margin-bottom: 5px; font-weight: 600; color: #333;">Full Name</label>
                <input type="text" id="settingsName" required style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 5px;">
              </div>
              <div style="margin-bottom: 20px;">
                <label style="display: block; margin-bottom: 5px; font-weight: 600; color: #333;">Email Address</label>
                <input type="email" id="settingsEmail" required style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 5px;">
              </div>
              <button type="submit" id="profileBtn" style="background: #1e3c72; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; font-weight: bold;">
                Save Profile
              </button>
            </form>
          </div>

          <!-- Password Form -->
          <div class="card" style="padding: 25px; background: #fff; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.05);">
            <h3 style="margin-bottom: 20px; border-bottom: 1px solid #eee; padding-bottom: 10px;"><i class="fas fa-lock"></i> Security</h3>
            
            <div id="passwordAlert" class="alert-message" style="display: none; padding: 10px; border-radius: 5px; margin-bottom: 15px;"></div>

            <form id="passwordForm">
              <div style="margin-bottom: 15px;">
                <label style="display: block; margin-bottom: 5px; font-weight: 600; color: #333;">Current Password</label>
                <input type="password" id="currentPassword" required style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 5px;">
              </div>
              <div style="margin-bottom: 15px;">
                <label style="display: block; margin-bottom: 5px; font-weight: 600; color: #333;">New Password</label>
                <input type="password" id="newPassword" required minlength="6" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 5px;">
              </div>
              <div style="margin-bottom: 20px;">
                <label style="display: block; margin-bottom: 5px; font-weight: 600; color: #333;">Confirm New Password</label>
                <input type="password" id="confirmPassword" required minlength="6" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 5px;">
              </div>
              <button type="submit" id="passwordBtn" style="background: #27ae60; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; font-weight: bold;">
                Update Password
              </button>
            </form>
          </div>

        </div>
      </section>
    `;
  },

  init: function () {
    const mainContent = document.getElementById("main-content");

    if (!document.getElementById("settings")) {
      const section = document.createElement("div");
      section.innerHTML = this.render();
      mainContent.appendChild(section.firstElementChild);
    }

    this.loadUserData();
    this.attachEventListeners();
  },

  loadUserData: function () {
    // Populate form with existing data from localStorage
    const userStr = localStorage.getItem("user");
    if (userStr) {
      const user = JSON.parse(userStr);
      document.getElementById("settingsName").value = user.name || "";
      document.getElementById("settingsEmail").value = user.email || "";
    }
  },

  attachEventListeners: function () {
    document
      .getElementById("profileForm")
      .addEventListener("submit", (e) => this.handleProfileUpdate(e));
    document
      .getElementById("passwordForm")
      .addEventListener("submit", (e) => this.handlePasswordUpdate(e));
  },

  showAlert: function (elementId, message, isSuccess) {
    const alertEl = document.getElementById(elementId);
    alertEl.style.display = "block";
    alertEl.textContent = message;
    alertEl.style.backgroundColor = isSuccess ? "#d4edda" : "#f8d7da";
    alertEl.style.color = isSuccess ? "#155724" : "#721c24";
    alertEl.style.border = `1px solid ${isSuccess ? "#c3e6cb" : "#f5c6cb"}`;

    // Auto-hide after 4 seconds
    setTimeout(() => {
      alertEl.style.display = "none";
    }, 4000);
  },

  handleProfileUpdate: async function (e) {
    e.preventDefault();
    const btn = document.getElementById("profileBtn");
    const name = document.getElementById("settingsName").value.trim();
    const email = document.getElementById("settingsEmail").value.trim();

    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
    btn.disabled = true;

    try {
      const response = await APIClient.put("/api/v1/system-profile/update", {
        name,
        email,
      });
      this.showAlert(
        "profileAlert",
        response.message || "Profile updated!",
        true,
      );

      // Update local storage so the header dynamically changes
      localStorage.setItem("user", JSON.stringify(response.user));

      // Update header UI immediately
      const headerEmail = document.getElementById("userEmail");
      const headerName = document.getElementById("userName");
      if (headerEmail) headerEmail.textContent = email;
      if (headerName) headerName.textContent = name;
    } catch (error) {
      this.showAlert("profileAlert", "Failed to update profile.", false);
    } finally {
      btn.innerHTML = "Save Profile";
      btn.disabled = false;
    }
  },

  handlePasswordUpdate: async function (e) {
    e.preventDefault();
    const btn = document.getElementById("passwordBtn");
    const currentPassword = document.getElementById("currentPassword").value;
    const newPassword = document.getElementById("newPassword").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    if (newPassword !== confirmPassword) {
      this.showAlert("passwordAlert", "New passwords do not match!", false);
      return;
    }

    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Updating...';
    btn.disabled = true;

    try {
      const response = await APIClient.put("/api/v1/system-profile/password", {
        currentPassword,
        newPassword,
      });
      this.showAlert(
        "passwordAlert",
        response.message || "Password updated securely!",
        true,
      );
      document.getElementById("passwordForm").reset(); // Clear the passwords out of the inputs
    } catch (error) {
      this.showAlert(
        "passwordAlert",
        "Incorrect current password or server error.",
        false,
      );
    } finally {
      btn.innerHTML = "Update Password";
      btn.disabled = false;
    }
  },
};

// Initialize when DOM is ready
document.addEventListener("DOMContentLoaded", function () {
  if (document.getElementById("settings")) return;
  SettingsPage.init();
});
