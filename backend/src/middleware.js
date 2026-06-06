const jwt = require("jsonwebtoken");

function requireAuth(jwtSecret) {
  return (req, res, next) => {
    const header = req.get("authorization") || "";
    const token = header.startsWith("Bearer ") ? header.slice("Bearer ".length) : null;
    if (!token) return res.status(401).json({ error: "missing_token" });

    try {
      req.user = jwt.verify(token, jwtSecret);
      return next();
    } catch {
      return res.status(401).json({ error: "invalid_token" });
    }
  };
}

module.exports = { requireAuth };
