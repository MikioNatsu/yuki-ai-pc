const bcrypt = require("bcryptjs");
const express = require("express");
const rateLimit = require("express-rate-limit");
const jwt = require("jsonwebtoken");
const { z } = require("zod");
const { requireAuth } = require("../middleware");

const registerSchema = z.object({
  email: z.string().email().transform((value) => value.toLowerCase()),
  password: z.string().min(8),
  displayName: z.string().min(1).max(80).optional()
});

const loginSchema = z.object({
  email: z.string().email().transform((value) => value.toLowerCase()),
  password: z.string().min(1)
});

function createToken(user, jwtSecret) {
  return jwt.sign(
    { sub: String(user.id), email: user.email, displayName: user.display_name || "" },
    jwtSecret,
    { expiresIn: "7d" }
  );
}

function publicUser(user) {
  return {
    id: user.id,
    email: user.email,
    displayName: user.display_name || ""
  };
}

function createAuthRouter({ db, jwtSecret }) {
  const router = express.Router();
  const loginLimiter = rateLimit({ windowMs: 60_000, limit: 10, standardHeaders: true, legacyHeaders: false });
  const registerLimiter = rateLimit({ windowMs: 60_000, limit: 5, standardHeaders: true, legacyHeaders: false });

  router.post("/register", registerLimiter, async (req, res) => {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "invalid_payload" });

    const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(parsed.data.email);
    if (existing) return res.status(409).json({ error: "email_taken" });

    const passwordHash = await bcrypt.hash(parsed.data.password, 12);
    const info = db
      .prepare("INSERT INTO users (email, password_hash, display_name) VALUES (?, ?, ?)")
      .run(parsed.data.email, passwordHash, parsed.data.displayName || "");
    const user = db.prepare("SELECT id, email, display_name FROM users WHERE id = ?").get(info.lastInsertRowid);

    return res.status(201).json({ token: createToken(user, jwtSecret), user: publicUser(user) });
  });

  router.post("/login", loginLimiter, async (req, res) => {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "invalid_payload" });

    const user = db.prepare("SELECT * FROM users WHERE email = ?").get(parsed.data.email);
    if (!user) return res.status(401).json({ error: "invalid_credentials" });

    const ok = await bcrypt.compare(parsed.data.password, user.password_hash);
    if (!ok) return res.status(401).json({ error: "invalid_credentials" });

    return res.json({ token: createToken(user, jwtSecret), user: publicUser(user) });
  });

  router.get("/verify", requireAuth(jwtSecret), (req, res) => {
    const user = db.prepare("SELECT id, email, display_name FROM users WHERE id = ?").get(req.user.sub);
    if (!user) return res.status(401).json({ error: "invalid_token" });
    return res.json({ user: publicUser(user) });
  });

  return router;
}

module.exports = { createAuthRouter };
