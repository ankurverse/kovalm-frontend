function checkAuth(requiredRole = null) {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  // ❌ Not logged in
  if (!token || !user) {
    localStorage.clear();
    window.location.href = "/login.html";
    return;
  }

  try {
    // Decode JWT payload
    const payload = JSON.parse(atob(token.split(".")[1]));
    const now = Math.floor(Date.now() / 1000);

    // ⏰ Token expired
    if (payload.exp < now) {
      alert("Session expired. Please login again.");
      localStorage.clear();
      window.location.href = "/login.html";
      return;
    }

    // 🔒 Role protection
    if (requiredRole && user.role !== requiredRole) {
      alert("Unauthorized access");
      window.location.href = "/index.html";
    }

  } catch (err) {
    // Corrupted token
    localStorage.clear();
    window.location.href = "/login.html";
  }
}
