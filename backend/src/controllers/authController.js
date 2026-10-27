const bcrypt = require("bcryptjs");
const { Account } = require("../models");
const { createToken, requireAuth } = require("../auth");

const publicAccount = account => ({
  id: account._id,
  name: account.name,
  email: account.email,
  username: account.username,
  role: account.role
});

async function signup(req, res) {
  const { name, email, username, password, role = "participant", college, year, bio, organization } = req.body;
  if (!name || !email || !username || !password || !["organizer", "participant"].includes(role)) {
    return res.status(400).json({ error: "name, email, username, password, and a valid role are required." });
  }
  if (String(password).length < 8) {
    return res.status(400).json({ error: "Password must contain at least 8 characters." });
  }

  try {
    const account = await Account.create({
      name, role, college, year, bio, organization,
      email: String(email).trim().toLowerCase(),
      username: String(username).trim().toLowerCase(),
      passwordHash: await bcrypt.hash(String(password), 12)
    });
    res.status(201).json({ token: createToken(account), account: publicAccount(account) });
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ error: "Email or username is already registered." });
    throw error;
  }
}

async function login(req, res) {
  const loginValue = String(req.body.login || "").trim().toLowerCase();
  const account = await Account.findOne({ $or: [{ email: loginValue }, { username: loginValue }] });
  if (!account || !(await bcrypt.compare(String(req.body.password || ""), account.passwordHash))) {
    return res.status(401).json({ error: "Invalid username/email or password." });
  }
  res.json({ token: createToken(account), account: publicAccount(account) });
}

async function currentAccount(req, res) {
  const account = await Account.findById(req.auth.sub).select("-passwordHash");
  if (!account) return res.status(404).json({ error: "Account not found." });
  res.json({ account });
}

module.exports = { signup, login, currentAccount, requireAuth };
