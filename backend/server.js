require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");

const connectDatabase = require("./src/config/database");
const apiRouter = require("./src/routes");

const app = express();
const port = Number(process.env.PORT) || 3000;
const frontendPath = path.join(__dirname, "..", "frontend");

app.use(cors({ origin: process.env.CLIENT_ORIGIN || true }));
app.use(express.json({ limit: "1mb" }));
app.use(express.static(frontendPath));

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    service: "formfactor-api",
    database: app.locals.databaseStatus || "not-connected",
    timestamp: new Date().toISOString()
  });
});

app.use("/api", apiRouter);

app.use((error, req, res, next) => {
  if (error instanceof SyntaxError && error.status === 400 && error.body) {
    return res.status(400).json({ error: "Request body contains invalid JSON." });
  }

  console.error(error);
  res.status(500).json({ error: "Internal server error." });
});

async function startServer() {
  await connectDatabase();
  app.locals.databaseStatus = "connected";
  return app.listen(port, () => {
    console.log(`Formfactor API running on http://localhost:${port}`);
  });
}

if (require.main === module) {
  startServer().catch((error) => {
    app.locals.databaseStatus = "unavailable";
    console.error(`MongoDB connection failed: ${error.message}`);
    process.exitCode = 1;
  });
}

module.exports = { app, startServer };
