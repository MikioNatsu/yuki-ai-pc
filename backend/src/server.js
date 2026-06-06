require("dotenv").config();

const cors = require("cors");
const express = require("express");
const helmet = require("helmet");
const { createDatabase } = require("./db");
const { createAuthRouter } = require("./routes/auth");
const { createAiRouter } = require("./routes/ai");

function createApp(options = {}) {
  const config = {
    port: Number(process.env.PORT || 4000),
    databaseUrl: process.env.DATABASE_URL || "./data/vr-assistant.sqlite",
    jwtSecret: process.env.JWT_SECRET || "dev-only-change-me",
    openRouterApiKey: process.env.OPENROUTER_API_KEY || "",
    defaultModel: process.env.DEFAULT_MODEL || "openrouter/auto",
    tokenLimit: Number(process.env.TOKEN_LIMIT || 1800),
    clientOrigin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
    ...options
  };

  const db = options.db || createDatabase(config.databaseUrl);
  const app = express();

  app.locals.config = config;
  app.locals.db = db;

  app.use(helmet());
  app.use(cors({ origin: config.clientOrigin, credentials: true }));
  app.use(express.json({ limit: "1mb" }));

  app.get("/health", (_req, res) => res.json({ ok: true }));
  app.use("/api/auth", createAuthRouter({ db, jwtSecret: config.jwtSecret }));
  app.use("/api/ai", createAiRouter(config));

  app.use((err, _req, res, _next) => {
    console.error("Unhandled server error", err.message);
    res.status(500).json({ error: "internal_error" });
  });

  return app;
}

if (require.main === module) {
  const app = createApp();
  const port = app.locals.config.port;
  app.listen(port, () => console.info(`VR Assistant host listening on ${port}`));
}

module.exports = { createApp };
