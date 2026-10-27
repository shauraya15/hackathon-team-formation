const crypto = require("node:crypto");

function getSecret() {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured.");
  }
  return process.env.JWT_SECRET;
}

function base64Url(value) {
  return Buffer.from(value).toString("base64url");
}

function createToken(account) {
  const header = base64Url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload = base64Url(
    JSON.stringify({
      sub: account._id.toString(),
      role: account.role,
      exp: Math.floor(Date.now() / 1000) + 8 * 60 * 60
    })
  );
  const signature = crypto
    .createHmac("sha256", getSecret())
    .update(`${header}.${payload}`)
    .digest("base64url");
  return `${header}.${payload}.${signature}`;
}

function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  const parts = token.split(".");

  if (parts.length !== 3) {
    return res.status(401).json({ error: "Bearer token required." });
  }

  try {
    const expectedSignature = crypto
      .createHmac("sha256", getSecret())
      .update(`${parts[0]}.${parts[1]}`)
      .digest("base64url");
    const supplied = Buffer.from(parts[2]);
    const expected = Buffer.from(expectedSignature);

    if (supplied.length !== expected.length || !crypto.timingSafeEqual(supplied, expected)) {
      return res.status(401).json({ error: "Invalid or expired token." });
    }

    const payload = JSON.parse(Buffer.from(parts[1], "base64url").toString("utf8"));
    if (!payload.sub || payload.exp <= Math.floor(Date.now() / 1000)) {
      return res.status(401).json({ error: "Invalid or expired token." });
    }

    req.auth = payload;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid or expired token." });
  }
}

function requireRole(role) {
  return (req, res, next) => {
    if (req.auth.role !== role) {
      return res.status(403).json({ error: `${role} role required.` });
    }
    next();
  };
}

module.exports = { createToken, requireAuth, requireRole };
