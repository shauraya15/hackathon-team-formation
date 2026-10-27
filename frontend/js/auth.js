const accountType = document.body.dataset.accountType;
const accountKey = accountType === 'organizer' ? 'organizers' : 'participantAccounts';
const sessionKey = accountType === 'organizer' ? 'loggedInOrganizerId' : 'loggedInParticipantId';

function getAccounts() {
  try { return JSON.parse(localStorage.getItem(accountKey)) || []; }
  catch (error) { return []; }
}

function saveAccounts(accounts) { localStorage.setItem(accountKey, JSON.stringify(accounts)); }
function makeId() { return `${Date.now()}-${Math.random().toString(16).slice(2)}`; }
function findAccount(login) {
  const normalizedLogin = login.trim().toLowerCase();
  return getAccounts().find((account) => {
    const username = typeof account.username === 'string' ? account.username.trim().toLowerCase() : '';
    const email = typeof account.email === 'string' ? account.email.trim().toLowerCase() : '';
    return username === normalizedLogin || email === normalizedLogin;
  });
}

const loginForm = document.getElementById('login-form');
if (loginForm) {
  loginForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const account = findAccount(document.getElementById('login').value.trim());
    const error = document.getElementById('auth-error');
    if (!account || String(account.password) !== document.getElementById('password').value) {
      error.textContent = 'That username or password does not match our records.';
      return;
    }
    localStorage.setItem(sessionKey, account.id);
    window.location.href = accountType === 'organizer' ? '../pages/organizer-dashboard.html' : '../pages/participant-dashboard.html';
  });
}

const signupForm = document.getElementById('signup-form');
if (signupForm) {
  signupForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const error = document.getElementById('auth-error');
    const password = document.getElementById('password').value;
    if (password !== document.getElementById('confirm-password').value) { error.textContent = 'Passwords do not match.'; return; }
    const accounts = getAccounts();
    const username = document.getElementById('username').value.trim();
    const email = document.getElementById('email').value.trim();
    if (accounts.some((account) => account.username.toLowerCase() === username.toLowerCase() || account.email.toLowerCase() === email.toLowerCase())) { error.textContent = 'That username or email is already registered.'; return; }
    const account = { id: makeId(), name: document.getElementById('name').value.trim(), email, phone: document.getElementById('phone').value.trim(), username, password };
    if (accountType === 'organizer') account.org = document.getElementById('org').value.trim();
    else { account.college = document.getElementById('college').value.trim(); account.year = document.getElementById('year').value; account.bio = document.getElementById('bio').value.trim(); }
    accounts.push(account); saveAccounts(accounts); localStorage.setItem(sessionKey, account.id); window.location.href = accountType === 'organizer' ? '../pages/organizer-dashboard.html' : '../pages/participant-dashboard.html';
  });
}

const forgotLink = document.getElementById('forgot-password-link');
if (forgotLink) {
  forgotLink.addEventListener('click', (event) => {
    event.preventDefault();
    if (document.getElementById('reset-form')) return;
    const resetForm = document.createElement('form');
    resetForm.className = 'auth-form reset-form';
    resetForm.id = 'reset-form';
    resetForm.innerHTML = '<div class="form-field"><label for="reset-email">Account email</label><input id="reset-email" type="email" placeholder="you@example.com" required></div><div class="form-field"><label for="reset-password">New password</label><input id="reset-password" type="password" required></div><div class="form-field"><label for="reset-confirm-password">Confirm new password</label><input id="reset-confirm-password" type="password" required></div><p class="auth-error" id="reset-error"></p><button class="auth-submit" type="submit">Reset password</button>';
    document.getElementById('login-form').insertAdjacentElement('afterend', resetForm);
    resetForm.addEventListener('submit', (resetEvent) => {
      resetEvent.preventDefault();
      const error = document.getElementById('reset-error');
      const email = document.getElementById('reset-email').value.trim().toLowerCase();
      const newPassword = document.getElementById('reset-password').value;
      if (newPassword !== document.getElementById('reset-confirm-password').value) { error.textContent = 'Passwords do not match.'; return; }
      const accounts = getAccounts();
      const accountIndex = accounts.findIndex((account) => account.email.toLowerCase() === email);
      if (accountIndex === -1) { error.textContent = 'No account was found with that email.'; return; }
      accounts[accountIndex].password = newPassword;
      saveAccounts(accounts);
      resetForm.remove();
      document.getElementById('auth-error').textContent = 'Password updated. You can now sign in.';
    });
  });
}
