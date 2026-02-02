// Authentication Handler (uses utils.js for API_BASE_URL and common functions)

// Toggle between login and signup forms
function toggleAuthForm() {
  const loginForm = document.getElementById("loginForm");
  const signupForm = document.getElementById("signupForm");

  if (loginForm.style.display === "none") {
    loginForm.style.display = "block";
    signupForm.style.display = "none";
  } else {
    loginForm.style.display = "none";
    signupForm.style.display = "block";
  }
}

// Handle form submission (login or signup)
async function handleAuthSubmit(event) {
  event.preventDefault();

  const form = event.target;
  const isLogin = form.closest("#loginForm") !== null;

  if (isLogin) {
    await handleLogin(form);
  } else {
    await handleSignup(form);
  }
}

// Handle login
async function handleLogin(form) {
  const email = form.querySelector('input[type="email"]').value;
  const password = form.querySelector('input[type="password"]').value;

  if (!email || !password) {
    showMessage("Please fill in all fields", "error");
    return;
  }

  try {
    console.log("🔄 Logging in...");
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (data.success) {
      console.log("✅ Login successful:", data.user);

      // Save user data to localStorage
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("userId", data.user.id);
      localStorage.setItem("userEmail", data.user.email);
      localStorage.setItem("userName", data.user.name);

      showMessage("Welcome back! Redirecting...", "success");

      // Redirect to menu page after 1 second
      setTimeout(() => {
        window.location.href = "../menu/menu.html";
      }, 1000);
    } else {
      console.error("❌ Login failed:", data.error);
      showMessage(data.error || "Invalid email or password", "error");
    }
  } catch (error) {
    console.error("❌ Login error:", error);
    showMessage("An error occurred. Please try again.", "error");
  }
}

// Handle signup
async function handleSignup(form) {
  const firstName = form.querySelector('input[placeholder="John"]').value;
  const lastName = form.querySelector('input[placeholder="Doe"]').value;
  const email = form.querySelector('input[type="email"]').value;
  const phone = form.querySelector('input[type="tel"]').value;
  const password = form.querySelector('input[type="password"]').value;

  if (!firstName || !lastName || !email || !password) {
    showMessage("Please fill in all required fields", "error");
    return;
  }

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    showMessage("Please enter a valid email address", "error");
    return;
  }

  // Password validation
  if (password.length < 6) {
    showMessage("Password must be at least 6 characters", "error");
    return;
  }

  try {
    console.log("🔄 Creating account...");
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        full_name: `${firstName} ${lastName}`,
        email,
        password,
        phone: phone || null,
      }),
    });

    const data = await response.json();

    if (data.success) {
      console.log("✅ Registration successful:", data.user);

      // Save user data to localStorage
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("userId", data.user.id);
      localStorage.setItem("userEmail", data.user.email);
      localStorage.setItem("userName", data.user.name);

      showMessage("Account created successfully! Redirecting...", "success");

      // Redirect to menu page after 1 second
      setTimeout(() => {
        window.location.href = "../menu/menu.html";
      }, 1000);
    } else {
      console.error("❌ Registration failed:", data.error);
      showMessage(
        data.error || "Registration failed. Please try again.",
        "error",
      );
    }
  } catch (error) {
    console.error("❌ Registration error:", error);
    showMessage("An error occurred. Please try again.", "error");
  }
}

// Show message to user
function showMessage(message, type = "info") {
  // Remove existing message if any
  const existingMessage = document.querySelector(".auth-message");
  if (existingMessage) {
    existingMessage.remove();
  }

  // Create message element
  const messageDiv = document.createElement("div");
  messageDiv.className = `auth-message ${type}`;
  messageDiv.textContent = message;

  // Add styles
  messageDiv.style.cssText = `
    position: fixed;
    top: 100px;
    left: 50%;
    transform: translateX(-50%);
    background: ${type === "success" ? "#4CAF50" : type === "error" ? "#f44336" : "#2196F3"};
    color: white;
    padding: 15px 30px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    z-index: 10000;
    font-size: 16px;
    animation: slideDown 0.3s ease-out;
  `;

  document.body.appendChild(messageDiv);

  // Remove after 3 seconds
  setTimeout(() => {
    messageDiv.style.animation = "slideUp 0.3s ease-out";
    setTimeout(() => messageDiv.remove(), 300);
  }, 3000);
}

// Add animation styles
const style = document.createElement("style");
style.textContent = `
  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateX(-50%) translateY(-20px);
    }
    to {
      opacity: 1;
      transform: translateX(-50%) translateY(0);
    }
  }
  
  @keyframes slideUp {
    from {
      opacity: 1;
      transform: translateX(-50%) translateY(0);
    }
    to {
      opacity: 0;
      transform: translateX(-50%) translateY(-20px);
    }
  }
`;
document.head.appendChild(style);

// Check if user is already logged in
document.addEventListener("DOMContentLoaded", function () {
  const user = localStorage.getItem("user");
  if (user) {
    console.log("👤 User already logged in");
    // Optionally redirect to menu
    // window.location.href = "../menu/menu.html";
  }
});
