const test = require("node:test");
const assert = require("node:assert/strict");
const { app } = require("../server");

test("GET /api/health reports the API status", async () => {
  const server = app.listen(0);

  try {
    const { port } = server.address();
    const response = await fetch(`http://localhost:${port}/api/health`);
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.equal(body.status, "ok");
    assert.equal(body.service, "formfactor-api");
    assert.equal(typeof body.timestamp, "string");
  } finally {
    await new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
  }
});

test("GET /api/skills returns the supported skill categories", async () => {
  const server = app.listen(0);

  try {
    const { port } = server.address();
    const response = await fetch(`http://localhost:${port}/api/skills`);
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.deepEqual(body.skills, ["Frontend", "Backend", "Design", "Data/ML", "DevOps/Cloud"]);
  } finally {
    await new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
  }
});

test("protected API routes reject requests without a bearer token", async () => {
  const server = app.listen(0);

  try {
    const { port } = server.address();
    const response = await fetch(`http://localhost:${port}/api/auth/me`);
    const body = await response.json();

    assert.equal(response.status, 401);
    assert.equal(body.error, "Bearer token required.");
  } finally {
    await new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
  }
});
