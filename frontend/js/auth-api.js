const accountType = document.body.dataset.accountType;

const forgotLink = document.getElementById("forgot-password-link");
if (forgotLink) {
  forgotLink.addEventListener("click", event => {
    event.preventDefault();
    document.getElementById("auth-error").textContent = "Password reset is not enabled in the Phase 2 demo. Ask the organizer to create a new account.";
  });
}

function redirectForRole(role) {
  window.location.href = role === "organizer"
    ? "../pages/organizer-dashboard.html"
    : "../pages/participant-dashboard.html";
}

const loginForm = document.getElementById("login-form");
if (loginForm) {
  loginForm.addEventListener("submit", async event => {
    event.preventDefault();
    const error = document.getElementById("auth-error");
    error.textContent = "";
    try {
      const result = await apiPost("/auth/login", {
        login: document.getElementById("login").value,
        password: document.getElementById("password").value
      });
      if (result.account.role !== accountType) throw new Error(`This is not a ${accountType} account.`);
      setApiSession(result.token, result.account);
      redirectForRole(result.account.role);
    } catch (requestError) {
      error.textContent = requestError.message;
    }
  });
}

const signupForm = document.getElementById("signup-form");
if (signupForm) {
  signupForm.addEventListener("submit", async event => {
    event.preventDefault();
    const error = document.getElementById("auth-error");
    error.textContent = "";
    const password = document.getElementById("password").value;
    if (password !== document.getElementById("confirm-password").value) {
      error.textContent = "Passwords do not match.";
      return;
    }

    const body = {
      role: accountType,
      name: document.getElementById("name").value,
      email: document.getElementById("email").value,
      username: document.getElementById("username").value,
      password
    };
    if (accountType === "organizer") body.organization = document.getElementById("org").value;
    else {
      body.college = document.getElementById("college").value;
      body.year = document.getElementById("year").value;
      body.bio = document.getElementById("bio").value;
    }

    try {
      const result = await apiPost("/auth/signup", body);
      setApiSession(result.token, result.account);
      redirectForRole(result.account.role);
    } catch (requestError) {
      error.textContent = requestError.message;
    }
  });
}
